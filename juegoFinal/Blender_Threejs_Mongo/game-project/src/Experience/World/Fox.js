import * as THREE from 'three'

export default class Fox {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('fox')
        }

        // Resource
        this.resource = this.resources.items.foxModel

        this.setModel()
        this.setAnimation()
        // Parámetros de seguimiento
        this.follow = {
            enabled: true,
            walkSpeed: 1.8,
            runSpeed: 3.6,
            // Distancia mínima al jugador (mayor -> menos pegado)
            stopDistance: 3.5,
            // Distancia a partir de la cual corre en vez de caminar
            runDistance: 7.0,
            rotationLerp: 0.15
        }
    }

    setModel() {
        this.model = this.resource.scene
        this.model.scale.set(0.02, 0.02, 0.02)
        this.model.position.set(3, 0, 0)
        this.scene.add(this.model)
        //Activando la sobra de fox
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }
    //Manejo GUI
    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions
        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
        }
    }

    update() {
        const deltaSeconds = (this.time.delta || 16) * 0.001
        this.animation.mixer.update(this.time.delta * 0.001)

        if (!this.follow.enabled) return

        const world = this.experience.world
        const robot = world?.robot
        if (!robot) return

        // Obtener posición objetivo (preferir física si existe)
        const targetPos = robot.body?.position ? new THREE.Vector3(robot.body.position.x, robot.body.position.y, robot.body.position.z) : (robot.group ? robot.group.position.clone() : null)
        if (!targetPos) return

        const foxPos = this.model.position
        const dir = new THREE.Vector3().subVectors(targetPos, foxPos)
        // Sólo mover en XZ
        dir.y = 0
        const distance = dir.length()

        if (distance > this.follow.stopDistance + 0.01) {
            // Normalizar dirección y mover
            dir.normalize()

            const speed = distance > this.follow.runDistance ? this.follow.runSpeed : this.follow.walkSpeed
            const moveStep = speed * deltaSeconds
            // No sobrepasar la posición objetivo
            const step = Math.min(moveStep, Math.max(0, distance - this.follow.stopDistance))
            this.model.position.addScaledVector(dir, step)

            // Rotación suave hacia la dirección de movimiento
            const targetRotation = Math.atan2(dir.x, dir.z)
            const currentY = this.model.rotation.y
            // Lerp manual sobre el ángulo (considerar wrap-around)
            let deltaAngle = targetRotation - currentY
            while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2
            while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2
            this.model.rotation.y = currentY + deltaAngle * this.follow.rotationLerp

            // Elegir animación
            if (speed === this.follow.runSpeed) {
                if (this.animation.actions.current !== this.animation.actions.running) this.animation.play('running')
            } else {
                if (this.animation.actions.current !== this.animation.actions.walking) this.animation.play('walking')
            }
        } else {
            // Cerca del jugador: estar en idle
            if (this.animation.actions.current !== this.animation.actions.idle) this.animation.play('idle')
        }
    }
}
