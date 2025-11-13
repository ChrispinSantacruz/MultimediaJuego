import * as THREE from 'three'

export default class MainCharacter {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('mainCharacter')
        }

        // Recursos FBX
        this.runResource = this.resources.items.mainCharacterRun
        this.idleResource = this.resources.items.mainCharacterIdle
        this.jumpResource = this.resources.items.mainCharacterJump

        this.setModel()
        this.setAnimation()
    }

    setModel() {
        // Usar el modelo del primer recurso como base (idle)
        this.model = this.idleResource.clone()
        this.model.scale.set(0.01, 0.01, 0.01) // Ajustar escala según necesidad
        this.model.position.set(0, 0, 0)
        this.scene.add(this.model)

        // Activar sombras
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions
        this.animation.actions = {}

        // Cargar animaciones de cada FBX
        if (this.idleResource.animations && this.idleResource.animations.length > 0) {
            this.animation.actions.idle = this.animation.mixer.clipAction(this.idleResource.animations[0])
        }

        if (this.runResource.animations && this.runResource.animations.length > 0) {
            this.animation.actions.running = this.animation.mixer.clipAction(this.runResource.animations[0])
        }

        if (this.jumpResource.animations && this.jumpResource.animations.length > 0) {
            this.animation.actions.jumping = this.animation.mixer.clipAction(this.jumpResource.animations[0])
        }

        // Acción actual
        this.animation.actions.current = this.animation.actions.idle
        if (this.animation.actions.current) {
            this.animation.actions.current.play()
        }

        // Función para cambiar animaciones
        this.animation.play = (name) => {
            if (!this.animation.actions[name]) {
                console.warn(`Animación "${name}" no encontrada`)
                return
            }

            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            
            if (oldAction && oldAction !== newAction) {
                newAction.crossFadeFrom(oldAction, 0.5)
            }

            this.animation.actions.current = newAction
        }

        // Debug
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playRunning: () => { this.animation.play('running') },
                playJumping: () => { this.animation.play('jumping') }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playRunning')
            this.debugFolder.add(debugObject, 'playJumping')
        }
    }

    update() {
        if (this.animation.mixer) {
            this.animation.mixer.update(this.time.delta * 0.001)
        }
    }

    destroy() {
        if (this.model) {
            this.scene.remove(this.model)
        }
        if (this.animation.mixer) {
            this.animation.mixer.stopAllAction()
        }
    }
}
