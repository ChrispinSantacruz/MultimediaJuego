// Experience/Utils/Physics.js
import * as CANNON from 'cannon-es'

export default class Physics {
    constructor() {
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.82, 0)
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.allowSleep = true

        this.defaultMaterial = new CANNON.Material('default')
        const defaultContact = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.4,
                restitution: 0.0
            }
        )
        this.world.defaultContactMaterial = defaultContact
        this.world.addContactMaterial(defaultContact)

        this.robotMaterial = new CANNON.Material('robot')
        this.obstacleMaterial = new CANNON.Material('obstacle')
        this.wallMaterial = new CANNON.Material('wall')

        const robotObstacleContact = new CANNON.ContactMaterial(
            this.robotMaterial,
            this.obstacleMaterial,
            {
                friction: 0.8,                      // Aumentado de 0.6 a 0.8 para menos deslizamiento
                restitution: 0.0,                   // Sin rebote (ya estaba bien)
                contactEquationStiffness: 1e8,      // Reducido de 1e9 a 1e8 para colisiones más suaves
                contactEquationRelaxation: 4,       // Aumentado de 3 a 4 para más amortiguación
                frictionEquationStiffness: 1e6,     // Reducido de 1e7 a 1e6 para menos fuerza de fricción
                frictionEquationRelaxation: 4       // Aumentado de 3 a 4
            }
        )
        this.world.addContactMaterial(robotObstacleContact)

        const robotWallContact = new CANNON.ContactMaterial(
            this.robotMaterial,
            this.wallMaterial,
            {
                friction: 0.9,                      // Aumentado de 0.6 a 0.9 (paredes más pegajosas)
                restitution: 0.0,                   // Sin rebote
                contactEquationStiffness: 1e8,      // Reducido de 1e9 a 1e8
                contactEquationRelaxation: 4,       // Aumentado de 2 a 4 para más suavidad
                frictionEquationStiffness: 1e6,     // Reducido de 1e7 a 1e6
                frictionEquationRelaxation: 4       // Aumentado de 2 a 4
            }
        )
        this.world.addContactMaterial(robotWallContact)
    }

    update(delta) {
        // 💣 Limpia cualquier shape corrupto o desconectado
        this.world.bodies = this.world.bodies.filter(body => {
            if (!body || !Array.isArray(body.shapes) || body.shapes.length === 0) return false

            for (const shape of body.shapes) {
                if (!shape || !shape.body || shape.body !== body) return false
            }

            return true
        })

        // ✅ Intenta avanzar la simulación sin romper
        try {
            this.world.step(1 / 60, delta, 3)
        } catch (err) {
            // Silenciar solo el error exacto de wakeUpAfterNarrowphase
            if (err?.message?.includes('wakeUpAfterNarrowphase')) {
                console.warn('⚠️ Cannon encontró un shape corrupto residual. Ignorado.')
            } else {
                console.error('🚫 Cannon step error:', err)
            }
        }
    }



}
