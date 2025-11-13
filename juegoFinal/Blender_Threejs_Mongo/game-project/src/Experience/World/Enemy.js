import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export default class Enemy {
    constructor(experience, position) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.physics = this.experience.physics
        this.target = null
        this.speed = 6
        this.chaseDistance = 300
        
        this.position = position
        this.loadModel()
    }
    
    async loadModel() {
        const loader = new FBXLoader()
        
        try {
            const fbx = await loader.loadAsync('/models/enemigo/enemigocorriendo.fbx')
            this.modelResource = fbx
            this.setModel()
            this.setPhysics(this.position)
            this.setAnimation()
        } catch (error) {
            console.error('❌ Error cargando enemigo:', error)
        }
    }
    
    setModel() {
        this.model = this.modelResource
        this.model.scale.set(0.01, 0.01, 0.01)
        this.model.position.set(0, -0.5, 0)
        
        this.group = new THREE.Group()
        this.group.add(this.model)
        this.scene.add(this.group)
        
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        
        console.log('✅ Enemigo FBX creado')
    }
    
    setPhysics(position) {
        const shape = new CANNON.Sphere(0.4)
        
        this.body = new CANNON.Body({
            mass: 2,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y || 1, position.z),
            linearDamping: 0.1, // Más damping para movimientos más suaves
            angularDamping: 0.9
        })
        
        this.body.angularFactor.set(0, 1, 0)
        this.body.velocity.setZero()
        this.body.angularVelocity.setZero()
        this.body.sleep()
        this.body.material = this.physics.obstacleMaterial
        
        this.physics.world.addBody(this.body)
        
        setTimeout(() => {
            this.body.wakeUp()
        }, 100)
    }
    
    setAnimation() {
        this.animation = {}
        
        if (!this.modelResource?.animations || this.modelResource.animations.length === 0) {
            console.warn('⚠️ No hay animaciones en el FBX')
            return
        }
        
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        const action = this.animation.mixer.clipAction(this.modelResource.animations[0])
        action.play()
        this.animation.actions = { running: action }
        console.log('✅ Animación enemigo FBX cargada')
    }
    
    setTarget(target) {
        this.target = target
    }
    
    update() {
        // Solo actualizar si el enemigo está completamente inicializado
        if (!this.body || !this.group) return
        
        // Actualizar animación (optimizado)
        if (this.animation?.mixer && this.time) {
            this.animation.mixer.update(this.time.delta * 0.001)
        }
        
        // Sincronizar posición visual con física PRIMERO
        this.group.position.copy(this.body.position)
        
        // Perseguir al objetivo si existe
        if (!this.target?.body) return
        
        const targetPos = this.target.body.position
        const enemyPos = this.body.position
        
        // Calcular distancia al objetivo
        const dx = targetPos.x - enemyPos.x
        const dz = targetPos.z - enemyPos.z
        const distance = Math.sqrt(dx * dx + dz * dz)
        
        // Solo perseguir si está dentro del rango
        if (distance < this.chaseDistance && distance > 0.5) {
            // Dirección normalizada
            const dirX = dx / distance
            const dirZ = dz / distance
            
            // Aplicar velocidad directa (más eficiente que applyForce)
            this.body.velocity.x = dirX * this.speed
            this.body.velocity.z = dirZ * this.speed
            
            // Rotar hacia el objetivo
            const angle = Math.atan2(dirX, dirZ)
            this.group.rotation.y = angle
        } else if (distance >= this.chaseDistance) {
            // Fuera de rango - detener
            this.body.velocity.x *= 0.9
            this.body.velocity.z *= 0.9
        }
    }
    
    checkCollisionWithTarget() {
        if (!this.target || !this.target.body) return false
        
        const enemyPos = this.body.position
        const targetPos = this.target.body.position
        
        const dx = targetPos.x - enemyPos.x
        const dy = targetPos.y - enemyPos.y
        const dz = targetPos.z - enemyPos.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        // Radio de colisión (suma de los radios de las esferas)
        const collisionRadius = 0.4 + 0.4 // Ambos tienen radio 0.4
        const collisionDistance = collisionRadius * 1.5 // Con un margen para detectar colisión
        
        return distance < collisionDistance
    }
    
    remove() {
        // Remover de la escena
        if (this.group && this.group.parent) {
            this.scene.remove(this.group)
        }
        
        // Remover física
        if (this.body && this.physics.world) {
            this.physics.world.removeBody(this.body)
        }
        
        // Limpiar animaciones
        if (this.animation && this.animation.mixer) {
            this.animation.mixer.stopAllAction()
        }
        
        // Limpiar geometrías y materiales
        if (this.model) {
            this.model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose()
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.map) mat.map.dispose()
                                mat.dispose()
                            })
                        } else {
                            if (child.material.map) child.material.map.dispose()
                            child.material.dispose()
                        }
                    }
                }
            })
        }
    }
}