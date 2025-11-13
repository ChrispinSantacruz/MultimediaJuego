import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Sound from './Sound.js'

export default class Robot {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.physics = this.experience.physics
        this.keyboard = this.experience.keyboard
        this.debug = this.experience.debug
        this.points = 0

        this.setModel()
        this.setSounds()
        this.setPhysics()
        this.setAnimation()
    }

    setModel() {
        // Cargar modelo FBX del personaje principal
        this.model = this.resources.items.mainCharacterIdle
        this.model.scale.set(0.01, 0.01, 0.01) // Escala reducida para este modelo
        this.model.position.set(0, -0.5, 0) // Ajustar posición para que esté en el suelo

        this.group = new THREE.Group()
        this.group.add(this.model)
        this.scene.add(this.group)

        // Habilitar sombras
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    setPhysics() {
        //const shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.5, 0.3))
        const shape = new CANNON.Sphere(0.4)

        this.body = new CANNON.Body({
            mass: 2,
            shape: shape,
            //position: new CANNON.Vec3(4, 1, 0), // Apenas sobre el piso real (que termina en y=0)
            position: new CANNON.Vec3(0, 1.2, 0),
            linearDamping: 0.3,
            angularDamping: 0.9
        })

        this.body.angularFactor.set(0, 1, 0)

        // Estabilización inicial
        this.body.velocity.setZero()
        this.body.angularVelocity.setZero()
        this.body.sleep()
        this.body.material = this.physics.robotMaterial
        //console.log(' Robot material:', this.body.material.name)


        this.physics.world.addBody(this.body)
        //console.log(' Posición inicial del robot:', this.body.position)
        // Activar cuerpo después de que el mundo haya dado al menos un paso de simulación
        setTimeout(() => {
            this.body.wakeUp()
        }, 100) // 100 ms ≈ 6 pasos de simulación si step = 1/60
    }


    setSounds() {
        this.walkSound = new Sound('/sounds/robot/walking.mp3', { loop: true, volume: 0.5 })
        this.jumpSound = new Sound('/sounds/robot/jump.mp3', { volume: 0.8 })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        this.animation.actions = {}
        
        // Cargar FBX: quieto.fbx, correr.fbx, salto.fbx
        const quietoRes = this.resources.items.mainCharacterIdle
        const correrRes = this.resources.items.mainCharacterRun
        const saltoRes = this.resources.items.mainCharacterJump
        
        // Extraer animaciones
        const quietoClip = quietoRes?.animations?.[0]
        const correrClip = correrRes?.animations?.[0]
        const saltoClip = saltoRes?.animations?.[0]
        
        // Crear acciones simples
        if (quietoClip) {
            this.animation.actions.quieto = this.animation.mixer.clipAction(quietoClip)
        }
        
        if (correrClip) {
            this.animation.actions.correr = this.animation.mixer.clipAction(correrClip)
        }
        
        if (saltoClip) {
            this.animation.actions.salto = this.animation.mixer.clipAction(saltoClip)
            this.animation.actions.salto.setLoop(THREE.LoopOnce)
            this.animation.actions.salto.clampWhenFinished = true
        }
        
        if (!this.animation.actions.quieto) {
            console.error('❌ No se pudo cargar quieto.fbx')
            return
        }
        
        // Iniciar con quieto
        this.animation.actions.current = this.animation.actions.quieto
        this.animation.actions.current.play()

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            if (!newAction) return
            
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            if (oldAction && oldAction !== newAction) {
                newAction.crossFadeFrom(oldAction, 0.3)
            }
            this.animation.actions.current = newAction

            if (name === 'correr') {
                this.walkSound.play()
            } else {
                this.walkSound.stop()
            }

            if (name === 'salto') {
                this.jumpSound.play()
            }
        }
    }

    update() {
        // Actualizar animaciones
        if (this.animation && this.animation.mixer) {
            const delta = this.time.delta * 0.001
            this.animation.mixer.update(delta)
        }

        const keys = this.keyboard.getState()
        const moveForce = 200 // Aumentado para más velocidad
        const turnSpeed = 4.0
        const delta = this.time.delta * 0.001
        let isMoving = false

        // Limitar velocidad (aumentada para escapar de enemigos)
        const maxSpeed = 50
        this.body.velocity.x = Math.max(Math.min(this.body.velocity.x, maxSpeed), -maxSpeed)
        this.body.velocity.z = Math.max(Math.min(this.body.velocity.z, maxSpeed), -maxSpeed)
        
        // Limitar velocidad vertical para evitar salir disparado
        if (this.body.velocity.y > 15) {
            this.body.velocity.y = 15
        }
        if (this.body.velocity.y < -15) {
            this.body.velocity.y = -15
        }

        // Salto
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion)
        if (keys.space && this.body.position.y <= 0.51) {
            this.body.applyImpulse(new CANNON.Vec3(forward.x * 0.5, 2.5, forward.z * 0.5))
            this.animation.play('salto')
            return
        }

        // Límite de escenario
        if (this.body.position.y > 10) {
            this.body.position.set(0, 1.2, 0)
            this.body.velocity.set(0, 0, 0)
        }

        // Movimiento adelante
        if (keys.up) {
            const forward = new THREE.Vector3(0, 0, 1)
            forward.applyQuaternion(this.group.quaternion)
            this.body.applyForce(
                new CANNON.Vec3(forward.x * moveForce, 0, forward.z * moveForce),
                this.body.position
            )
            isMoving = true
        }

        // Movimiento atrás
        if (keys.down) {
            const backward = new THREE.Vector3(0, 0, -1)
            backward.applyQuaternion(this.group.quaternion)
            this.body.applyForce(
                new CANNON.Vec3(backward.x * moveForce, 0, backward.z * moveForce),
                this.body.position
            )
            isMoving = true
        }

        // Rotación
        if (keys.left) {
            this.group.rotation.y += turnSpeed * delta
            this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)
        }
        if (keys.right) {
            this.group.rotation.y -= turnSpeed * delta
            this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)
        }

        // Animaciones: quieto o correr
        if (isMoving) {
            if (this.animation.actions.current !== this.animation.actions.correr) {
                this.animation.play('correr')
            }
        } else {
            if (this.animation.actions.current !== this.animation.actions.quieto) {
                this.animation.play('quieto')
            }
        }

        // Sincronizar física con visual
        this.group.position.copy(this.body.position)
    }

    // Método para mover el robot desde el exterior VR
    moveInDirection(dir, speed) {
        if (!window.userInteracted || !this.experience.renderer.instance.xr.isPresenting) {
            return
        }

        // Si hay controles móviles activos
        const mobile = window.experience?.mobileControls
        if (mobile?.intensity > 0) {
            const dir2D = mobile.directionVector
            const dir3D = new THREE.Vector3(dir2D.x, 0, dir2D.y).normalize()

            const adjustedSpeed = 250 * mobile.intensity // velocidad más fluida
            const force = new CANNON.Vec3(dir3D.x * adjustedSpeed, 0, dir3D.z * adjustedSpeed)

            this.body.applyForce(force, this.body.position)

            if (this.animation.actions.current !== this.animation.actions.walking) {
                this.animation.play('walking')
            }

            // Rotar suavemente en dirección de avance
            const angle = Math.atan2(dir3D.x, dir3D.z)
            this.group.rotation.y = angle
            this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)
        }
    }
    die() {
        this.walkSound.stop()
        
        // Eliminar cuerpo del mundo
        if (this.physics.world.bodies.includes(this.body)) {
            this.physics.world.removeBody(this.body)
        }
        this.body = null

        // Ajuste visual
        this.group.position.y -= 0.5
        this.group.rotation.x = -Math.PI / 2
        
        console.log('💀 Robot ha muerto')
    }



}
