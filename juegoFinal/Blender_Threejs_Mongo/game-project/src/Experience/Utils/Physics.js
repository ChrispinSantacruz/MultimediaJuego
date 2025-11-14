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
        this.floorMaterial = new CANNON.Material('floor')

        // Contacto robot-piso (más importante para caminar normal)
        const robotFloorContact = new CANNON.ContactMaterial(
            this.robotMaterial,
            this.floorMaterial,
            {
                friction: 0.8,                      // Fricción alta para no deslizarse
                restitution: 0.0,                    // Sin rebote
                contactEquationStiffness: 1e8,       // Rigidez moderada
                contactEquationRelaxation: 3,        // Relajación moderada
                frictionEquationStiffness: 1e7,      // Fricción firme
                frictionEquationRelaxation: 3
            }
        )
        this.world.addContactMaterial(robotFloorContact)

        const robotObstacleContact = new CANNON.ContactMaterial(
            this.robotMaterial,
            this.obstacleMaterial,
            {
                friction: 0.3,                      // Reducido de 0.8 a 0.3 para evitar trabas
                restitution: 0.05,                  // Mínimo rebote (0.05) para evitar rebotes exagerados
                contactEquationStiffness: 5e7,      // Reducido de 1e8 a 5e7 para colisiones más suaves
                contactEquationRelaxation: 5,       // Aumentado de 4 a 5 para mayor amortiguación
                frictionEquationStiffness: 5e5,     // Reducido de 1e6 a 5e5 para movimiento más fluido
                frictionEquationRelaxation: 5       // Aumentado de 4 a 5
            }
        )
        this.world.addContactMaterial(robotObstacleContact)

        const robotWallContact = new CANNON.ContactMaterial(
            this.robotMaterial,
            this.wallMaterial,
            {
                friction: 0.3,                      // Reducido de 0.9 a 0.3 para evitar trabas en paredes
                restitution: 0.05,                  // Mínimo rebote para evitar rebotes exagerados
                contactEquationStiffness: 5e7,      // Reducido de 1e8 a 5e7
                contactEquationRelaxation: 5,       // Aumentado de 4 a 5 para más suavidad
                frictionEquationStiffness: 5e5,     // Reducido de 1e6 a 5e5
                frictionEquationRelaxation: 5       // Aumentado de 4 a 5
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
