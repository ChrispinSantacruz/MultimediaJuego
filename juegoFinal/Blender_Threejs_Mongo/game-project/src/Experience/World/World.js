import * as THREE from 'three'
import MobileControls from '../../controls/MobileControls.js'
import ToyCarLoader from '../../loaders/ToyCarLoader.js'
import FinalPrizeParticles from '../Utils/FinalPrizeParticles.js'
import AmbientSound from './AmbientSound.js'
import BlockPrefab from './BlockPrefab.js'
import Enemy from './Enemy.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'
import Sign from './Sign.js'
import LevelManager from './LevelManager.js'
import MainCharacter from './MainCharacter.js'
import Robot from './Robot.js'
import Sound from './Sound.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'


export default class World {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.blockPrefab = new BlockPrefab(this.experience)
        this.resources = this.experience.resources
        this.levelManager = new LevelManager(this.experience);
        this.finalPrizeActivated = false
        this.levelProgressing = false  // Prevenir progresión múltiple
        this.gameStarted = false
        
        // Sistema de puntuación total
        this.totalPoints = 0;  // Puntos acumulados de todos los niveles
        this.levelPoints = {}; // Puntos por nivel individual
        this.currentLevelPoints = 0; // Puntos del nivel actual
        this.enemies = []

        this.coinSound = new Sound('/sounds/coin.ogg')
        this.ambientSound = new AmbientSound('/sounds/ambiente.mp3')
        this.winner = new Sound('/sounds/winner.mp3')
        this.portalSound = new Sound('/sounds/portal.mp3')
        this.loseSound = new Sound('/sounds/lose.ogg')


        this.allowPrizePickup = false
        this.hasMoved = false

        // Tiempo del último trabajo pesado (ms) para throttling
        this._lastHeavyUpdate = 0

        // Reducir delay inicial para mejorar experiencia de usuario
        setTimeout(() => {
            this.allowPrizePickup = true
            console.log('🎮 Recolección de monedas habilitada')
        }, 500)

        this.resources.on('ready', async () => {
            this.floor = new Floor(this.experience)
            this.environment = new Environment(this.experience)

            this.loader = new ToyCarLoader(this.experience)
            await this.loader.loadFromAPI()

            this.fox = new Fox(this.experience)
            this.robot = new Robot(this.experience)
            
            // Nuevo personaje principal con animaciones FBX
            this.mainCharacter = new MainCharacter(this.experience)

            // Crear enemigos según nivel actual
            this.currentLevel = 1
            const enemiesCount = this.currentLevel === 1 ? 1 : this.currentLevel === 2 ? 3 : 5
            this.spawnEnemies(enemiesCount)

            this.experience.vr.bindCharacter(this.robot)
            this.thirdPersonCamera = new ThirdPersonCamera(this.experience, this.robot.group)

            this.mobileControls = new MobileControls({
                onUp: (pressed) => { this.experience.keyboard.keys.up = pressed },
                onDown: (pressed) => { this.experience.keyboard.keys.down = pressed },
                onLeft: (pressed) => { this.experience.keyboard.keys.left = pressed },
                onRight: (pressed) => { this.experience.keyboard.keys.right = pressed }
            })

            if (!this.experience.physics || !this.experience.physics.world) {
                console.error("🚫 Sistema de físicas no está inicializado al cargar el mundo.");
                return;
            }

            // Si se está en modo VR, ocultar el robot
            this._checkVRMode()

            this.experience.renderer.instance.xr.addEventListener('sessionstart', () => {
                this._checkVRMode()
            })


        })
    }

    spawnEnemies(count = 3) {
        if (!this.robot?.body?.position) {
            console.warn('⚠️ Robot no disponible')
            return
        }

        if (this.enemies?.length) {
            this.enemies.forEach(e => e?.remove?.())
            this.enemies = []
        }

        console.log(`👾 Generando ${count} enemigos...`)

        // Posiciones predefinidas por nivel para evitar trabas
        const spawnPositions = {
            1: [
                { x: 21.980088558414113, y: 1, z: 0.022510138817641412 }
            ],
            2: [
                { x: -30, y: 1.5, z: 10 },
                { x: -20, y: 1.5, z: -10 },
                { x: 10, y: 1.5, z: 15 }
            ],
            3: [
                { x: -25, y: 1.5, z: 8 },
                { x: -15, y: 1.5, z: -12 },
                { x: 15, y: 1.5, z: 10 },
                { x: 25, y: 1.5, z: -8 },
                { x: 5, y: 1.5, z: 20 }
            ]
        }

        const positions = spawnPositions[this.currentLevel] || []

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i]
            const enemy = new Enemy(this.experience, pos)
            enemy.setTarget(this.robot)
            this.enemies.push(enemy)
            console.log(`✅ Enemigo ${i + 1} spawneado en (${pos.x}, ${pos.z})`)
        }
        
        console.log(`✅ ${this.enemies.length} enemigos creados en posiciones fijas`)
    }

    toggleAudio() {
        this.ambientSound.toggle()
    }

    update(delta) {
        this.fox?.update()
        this.robot?.update()
        this.mainCharacter?.update()
        this.blockPrefab?.update()

        // Mantener el cartel mirando al jugador cada frame (si existe)
        try {
            if (this.levelSign) {
                this.levelSign.lookAt(this.robot.group || this.robot.body?.position)
            }
        } catch (e) {
            // Ignorar errores de lookAt
        }

        // 🧟‍♂️ Solo actualizar enemigos si el juego ya comenzó
        if (this.gameStarted) {
            this.enemies?.forEach(e => e.update(delta))

            // 💀 Verificar si algún enemigo atrapó al jugador
            const distToClosest = this.enemies?.reduce((min, e) => {
                if (!e?.body?.position || !this.robot?.body?.position) return min
                const d = e.body.position.distanceTo(this.robot.body.position)
                return Math.min(min, d)
            }, Infinity) ?? Infinity

            if (distToClosest < 1.0 && !this.defeatTriggered) {
                this.defeatTriggered = true  // Previene múltiples disparos

                if (window.userInteracted && this.loseSound) {
                    this.loseSound.play()
                }

                const firstEnemy = this.enemies?.[0]
                const enemyMesh = firstEnemy?.model || firstEnemy?.group
                if (enemyMesh) {
                    enemyMesh.scale.set(1.3, 1.3, 1.3)
                    setTimeout(() => {
                        enemyMesh.scale.set(1, 1, 1)
                    }, 500)
                }

                this.experience.modal.show({
                    icon: '💀',
                    message: '¡El enemigo te atrapó!\n¿Quieres intentarlo otra vez?',
                    buttons: [
                        {
                            text: '🔁 Reintentar',
                            onClick: () => this.experience.resetGameToFirstLevel()
                        },
                        {
                            text: '❌ Salir',
                            onClick: () => this.experience.resetGame()
                        }
                    ]
                })

                return
            }
        }

        if (this.thirdPersonCamera && this.experience.isThirdPerson && !this.experience.renderer.instance.xr.isPresenting) {
            this.thirdPersonCamera.update()
        }

        this.loader?.prizes?.forEach(p => p.update(delta))

        if (!this.allowPrizePickup || !this.loader || !this.robot || !this.robot.body) return


        let pos = null

        if (this.experience.renderer.instance.xr.isPresenting) {
            pos = this.experience.camera.instance.position
        } else if (this.robot?.body?.position) {
            pos = this.robot.body.position
        } else {
            return // No hay posición válida, salimos del update
        }


        const speed = this.robot?.body?.velocity?.length?.() || 0
        // Permitir recolección si el jugador se movió aunque sea mínimamente
        // o si ha estado en el juego más de 3 segundos (evita pickup instantáneo al inicio)
        const hasMovedEnough = speed > 0.1 || this.hasMoved

        if (speed > 0.1 && !this.hasMoved) {
            this.hasMoved = true
        }

        this.loader.prizes.forEach((prize) => {
            if (!prize.pivot) return

            const dist = prize.pivot.position.distanceTo(pos)
            
            // Debug temporal: mostrar distancia cuando estás cerca
            if (dist < 3 && !prize.collected) {
                // Solo loguear ocasionalmente para no saturar consola
                if (Math.random() < 0.01) {
                    console.log(`🪙 Moneda detectada - Distancia: ${dist.toFixed(2)}m, Moved: ${hasMovedEnough}, Allow: ${this.allowPrizePickup}`);
                }
            }
            
            if (dist < 1.5 && hasMovedEnough && !prize.collected) {
                // Si es moneda final, verificar que esté activada
                if (prize.role === "finalPrize" && !this.finalPrizeActivated) {
                    console.log('⚠️ Moneda final aún no está activada. Recoge las monedas necesarias primero.');
                    return;
                }
                
                prize.collect()
                prize.collected = true
                console.log(`✅ Moneda recogida! Distancia: ${dist.toFixed(2)}m, Role: ${prize.role}`);

                if (prize.role === "default") {
                    this.currentLevelPoints = (this.currentLevelPoints || 0) + 1
                    this.totalPoints = (this.totalPoints || 0) + 1
                    this.robot.points = this.currentLevelPoints

                    const pointsTarget = this.levelManager.getCurrentLevelTargetPoints()
                    console.log(`🎯 Monedas recolectadas: ${this.currentLevelPoints} / ${pointsTarget} (Nivel ${this.levelManager.currentLevel})`);
                    console.log(`💰 Puntos totales acumulados: ${this.totalPoints}`);

                    if (!this.finalPrizeActivated && this.currentLevelPoints === pointsTarget) {
                        console.log(`🏆 ¡Activando moneda final del nivel ${this.levelManager.currentLevel}!`);
                        const finalCoin = this.loader.prizes.find(p => p.role === "finalPrize")
                        if (finalCoin && !finalCoin.collected && finalCoin.pivot) {
                            finalCoin.pivot.visible = true
                            if (finalCoin.model) finalCoin.model.visible = true
                            this.finalPrizeActivated = true
                            
                            console.log(`🔥 Moneda final visible en posición:`, finalCoin.pivot.position);

                            new FinalPrizeParticles({
                                scene: this.scene,
                                targetPosition: finalCoin.pivot.position,
                                sourcePosition: this.robot.body.position,
                                experience: this.experience
                            })

                            // Faro visual
                            this.discoRaysGroup = new THREE.Group()
                            this.scene.add(this.discoRaysGroup)

                            const rayMaterial = new THREE.MeshBasicMaterial({
                                color: 0xaa00ff,
                                transparent: true,
                                opacity: 0.25,
                                side: THREE.DoubleSide
                            })

                            const rayCount = 4
                            for (let i = 0; i < rayCount; i++) {
                                const cone = new THREE.ConeGeometry(0.2, 4, 6, 1, true)
                                const ray = new THREE.Mesh(cone, rayMaterial)

                                ray.position.set(0, 2, 0)
                                ray.rotation.x = Math.PI / 2
                                ray.rotation.z = (i * Math.PI * 2) / rayCount

                                const spot = new THREE.SpotLight(0xaa00ff, 2, 12, Math.PI / 7, 0.2, 0.5)
                                spot.castShadow = false
                                spot.shadow.mapSize.set(1, 1)
                                spot.position.copy(ray.position)
                                spot.target.position.set(
                                    Math.cos(ray.rotation.z) * 10,
                                    2,
                                    Math.sin(ray.rotation.z) * 10
                                )

                                ray.userData.spot = spot
                                this.discoRaysGroup.add(ray)
                                this.discoRaysGroup.add(spot)
                                this.discoRaysGroup.add(spot.target)
                            }

                            this.discoRaysGroup.position.copy(finalCoin.pivot.position)

                            if (window.userInteracted) {
                                this.portalSound.play()
                            }

                            console.log("🪙 Coin final activado correctamente.")
                        }
                    }
                }

                if (prize.role === "finalPrize") {
                    console.log(`🎆 ¡Moneda final del nivel ${this.levelManager.currentLevel} recogida!`);
                    
                    // Prevenir progresión múltiple
                    if (this.levelProgressing) {
                        console.log('⚠️ Progresión ya en curso, ignorando...');
                        return;
                    }
                    
                    this.levelProgressing = true;
                    console.log(`🎯 Nivel ${this.levelManager.currentLevel} completado. Avanzando al nivel ${this.levelManager.currentLevel + 1}...`);
                    console.log(`📊 Estado actual: currentLevelPoints=${this.currentLevelPoints}, totalPoints=${this.totalPoints}, currentLevel=${this.levelManager.currentLevel}`);
                    
                    // Guardar puntos del nivel completado
                    this.levelPoints[this.levelManager.currentLevel] = this.currentLevelPoints;
                    
                    // Avanzar al siguiente nivel automáticamente
                    if (this.levelManager.currentLevel < this.levelManager.totalLevels) {
                        // Pequeño delay para mostrar efectos visuales antes de cambiar
                        setTimeout(() => {
                            this.levelManager.nextLevel();
                            // Reset de progresión después del cambio
                            setTimeout(() => {
                                this.levelProgressing = false;
                            }, 500);
                        }, 1000);
                    } else {
                        // 🏆 ¡JUEGO COMPLETADO! - Mostrar modal con puntuación total final
                        const elapsed = this.experience.tracker.stop();
                        this.experience.tracker.saveTime(elapsed);
                        
                        // Calcular estadísticas finales
                        const finalStats = {
                            totalPoints: this.totalPoints,
                            levelPoints: this.levelPoints,
                            timeElapsed: elapsed
                        };
                        
                        this.experience.tracker.showFinalGameModal(finalStats);

                        this.experience.obstacleWavesDisabled = true;
                        clearTimeout(this.experience.obstacleWaveTimeout);
                        this.experience.raycaster?.removeAllObstacles();

                        if (window.userInteracted) {
                            this.winner.play();
                        }
                    }
                }

                if (this.experience.raycaster?.removeRandomObstacles) {
                    const reduction = 0.2 + Math.random() * 0.1
                    this.experience.raycaster.removeRandomObstacles(reduction)
                }

                if (window.userInteracted) {
                    this.coinSound.play()
                }

                this.experience.menu.setStatus?.(`🎖️ Nivel ${this.levelManager.currentLevel}: ${this.currentLevelPoints} | Total: ${this.totalPoints}`)
            }
        })

        // ⚠️ COMENTADO: Esta lógica duplicada estaba causando que se saltaran niveles
        // La activación de finalPrize ya se maneja correctamente arriba con currentLevelPoints === pointsTarget
        // Este bloque verificaba si TODAS las monedas default fueron recolectadas, pero no consideraba
        // el objetivo del nivel (pointsToComplete), causando que se activara prematuramente


        // Faro rotación
        if (this.discoRaysGroup) {
            this.discoRaysGroup.rotation.y += delta * 0.5
        }

        // Optimización física por distancia (throttle para reducir trabajo por frame)
        const now = (typeof performance !== 'undefined') ? performance.now() : Date.now()
        if (!this._lastHeavyUpdate) this._lastHeavyUpdate = 0
        if (now - this._lastHeavyUpdate > 400) {
            this._lastHeavyUpdate = now

            const playerPos = this.experience.renderer.instance.xr.isPresenting
                ? this.experience.camera.instance.position
                : this.robot?.body?.position

            if (playerPos) {
                this.scene.traverse((obj) => {
                    if (obj.userData?.levelObject && obj.userData.physicsBody) {
                        const dist = obj.position.distanceTo(playerPos)
                        const shouldEnable = dist < 40 && obj.visible

                        const body = obj.userData.physicsBody
                        if (shouldEnable && !body.enabled) {
                            body.enabled = true
                        } else if (!shouldEnable && body.enabled) {
                            body.enabled = false
                        }
                    }
                })
            }
        }
    }


    async loadLevel(level) {
        // Reset de variables importantes al cargar nuevo nivel
        this.currentLevelPoints = 0; // Solo resetear puntos del nivel actual
        this.finalPrizeActivated = false;
        this.levelProgressing = false;
        this.defeatTriggered = false;
        this.currentLevel = level;
        
        // Resetear estado de movimiento pero permitir pickup inmediato después de un pequeño delay
        this.hasMoved = false;
        this.allowPrizePickup = false;
        setTimeout(() => {
            this.allowPrizePickup = true;
            console.log('🎮 Recolección habilitada para nuevo nivel');
        }, 500);
        
        console.log(`🔄 Cargando nivel ${level}. Variables reseteadas.`);
        console.log(`📍 Nivel solicitado: ${level}, currentLevel será actualizado después.`);
        console.log(`💰 Puntos totales mantenidos: ${this.totalPoints}`);
        
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const apiUrl = `${backendUrl}/api/blocks?level=${level}`;

            let data;
            try {
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error('Error desde API');
                // Asegurar que la respuesta sea JSON
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('application/json')) {
                    const preview = (await res.text()).slice(0, 120);
                    throw new Error(`Respuesta no-JSON desde API (${apiUrl}): ${preview}`);
                }
                data = await res.json();
                console.log(`📦 Datos del nivel ${level} cargados desde API`);
            } catch (error) {
                console.warn(`⚠️ No se pudo conectar con el backend. Usando datos locales para nivel ${level}...`);
                const publicPath = (p) => {
                    const base = import.meta.env.BASE_URL || '/';
                    return `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
                };

                const localUrl = publicPath('data/toy_car_blocks.json');
                const localRes = await fetch(localUrl);
                if (!localRes.ok) {
                    const preview = (await localRes.text()).slice(0, 120);
                    throw new Error(`No se pudo cargar ${localUrl} (HTTP ${localRes.status}). Vista previa: ${preview}`);
                }
                const localCt = localRes.headers.get('content-type') || '';
                if (!localCt.includes('application/json')) {
                    const preview = (await localRes.text()).slice(0, 120);
                    throw new Error(`Contenido no JSON en ${localUrl}. Vista previa: ${preview}`);
                }
                const allBlocks = await localRes.json();

                const filteredBlocks = allBlocks.filter(b => b.level === level);
                console.log(`📊 Bloques filtrados para nivel ${level}:`, filteredBlocks.length);
                console.log(`🪙 Monedas en este nivel:`, filteredBlocks.filter(b => b.name.startsWith('coin')).map(b => `${b.name} (${b.role || 'default'})`));

                data = {
                    blocks: filteredBlocks,
                    spawnPoint: { x: -17, y: 1.5, z: -67 } // valor por defecto si no viene en JSON
                };
            }

            let spawnPoint = data.spawnPoint || { x: 5, y: 1.5, z: 5 };

            // Configurar spawn points específicos por nivel
            if (level === 2) {
                spawnPoint = { x: 3.907223611972176, y: 1, z: 4.767078502872419 }; // Nivel 2 - coordenadas especificadas
            } else if (level === 3) {
                spawnPoint = { x: 2.818863188461002, y: 1, z: -4.571316480248022 }; // Nivel 3 - coordenadas especificadas
            }
            this.points = 0;
            this.robot.points = 0;
            this.finalPrizeActivated = false;
            
            // 🔥 IMPORTANTE: Limpiar array de prizes ANTES de cargar nuevos bloques
            if (this.loader && this.loader.prizes) {
                console.log(`🧹 Limpiando ${this.loader.prizes.length} monedas del nivel anterior antes de cargar nuevas`);
                this.loader.prizes = [];
            }

            // --- Cartel por nivel: crear un letrero cerca del spawn para identificar el nivel ---
            try {
                // El cartel se colocará preferiblemente frente al jugador (según orientación del robot).
                // Si no es posible, caerá de vuelta a una posición fija delante del spawn.
                const fallbackOffset = { x: 0, y: 2.2, z: 6 }
                let signPos = {
                    x: spawnPoint.x + fallbackOffset.x,
                    y: spawnPoint.y + fallbackOffset.y,
                    z: spawnPoint.z + fallbackOffset.z
                }

                try {
                    // Si el robot tiene grupo (malla), usar su dirección para colocar el cartel enfrente
                    const robotGroup = this.robot?.group
                    if (robotGroup) {
                        // Obtener dirección forward del robot (en world space)
                        const forward = new THREE.Vector3(0, 0, 1)
                        robotGroup.getWorldDirection(forward)
                        forward.y = 0
                        forward.normalize()

                        // Colocar el cartel unos metros delante del robot
                        signPos = {
                            x: robotGroup.position.x + forward.x * 6,
                            y: robotGroup.position.y + 2.4,
                            z: robotGroup.position.z + forward.z * 6
                        }
                    }
                } catch (e) {
                    // Si cualquier fallo, usamos la posición por defecto
                }

                // Destruir cartel anterior si existía
                if (this.levelSign) {
                    try { this.levelSign.destroy() } catch (e) { /* ignore */ }
                    this.levelSign = null
                }

                this.levelSign = new Sign(this.experience, `Nivel ${level}`, signPos)
                // Hacer que el cartel mire hacia el jugador inicialmente
                this.levelSign.lookAt(this.robot.group || this.robot.body?.position)

                console.log(`📍 Cartel de Nivel ${level} creado en (${signPos.x.toFixed(1)}, ${signPos.y.toFixed(1)}, ${signPos.z.toFixed(1)})`)
            } catch (err) {
                console.warn('❗ No se pudo crear el cartel del nivel:', err)
            }
            
            this.experience.menu.setStatus?.(`🎖️ Puntos: ${this.points}`);

            if (data.blocks) {
                const publicPath = (p) => {
                    const base = import.meta.env.BASE_URL || '/';
                    return `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
                };
                const preciseUrl = publicPath('config/precisePhysicsModels.json');
                const preciseRes = await fetch(preciseUrl);
                if (!preciseRes.ok) {
                    const preview = (await preciseRes.text()).slice(0, 120);
                    throw new Error(`No se pudo cargar ${preciseUrl} (HTTP ${preciseRes.status}). Vista previa: ${preview}`);
                }
                const preciseCt = preciseRes.headers.get('content-type') || '';
                if (!preciseCt.includes('application/json')) {
                    const preview = (await preciseRes.text()).slice(0, 120);
                    throw new Error(`Contenido no JSON en ${preciseUrl}. Vista previa: ${preview}`);
                }
                const preciseModels = await preciseRes.json();
                this.loader._processBlocks(data.blocks, preciseModels);
            } else {
                await this.loader.loadFromURL(apiUrl);
            }


            this.loader.prizes.forEach(p => {
                // Ocultar moneda final y mostrar monedas default
                if (p.role === 'finalPrize') {
                    if (p.model) p.model.visible = false;
                    if (p.pivot) p.pivot.visible = false;
                } else {
                    if (p.model) p.model.visible = true;
                    if (p.pivot) p.pivot.visible = true;
                }
                p.collected = false;
            });

            // Si venimos de nivel 1 y ahora cargamos nivel 2, mover la primera moneda 'default' al frente del portal
            try {
                if (this.previousLevel === 1 && level === 2 && this.loader && Array.isArray(this.loader.prizes)) {
                    // Buscar objeto portal en la escena
                    const portalObj = this.scene.children.find(c => (c.name && c.name.toLowerCase().includes('portal')) || (c.children && c.children.some(ch => ch.name && ch.name.toLowerCase().includes('portal'))));
                    if (portalObj) {
                        // Obtener posición y quaternion en mundo
                        const portalPos = new THREE.Vector3();
                        portalObj.getWorldPosition(portalPos);
                        const portalQuat = new THREE.Quaternion();
                        portalObj.getWorldQuaternion(portalQuat);

                        // Forward local (z+) en orientación del portal
                        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(portalQuat).normalize();

                        // Colocar la moneda 2 unidades delante del portal
                        const distance = 2
                        const targetPos = portalPos.clone().add(forward.multiplyScalar(distance));
                        targetPos.y = 1; // asegurar altura de recogida

                        const firstDefault = this.loader.prizes.find(pr => pr && pr.role === 'default')
                        if (firstDefault && firstDefault.pivot) {
                            console.log('🔁 Moviendo primera moneda default delante del portal en:', targetPos)
                            firstDefault.pivot.position.copy(targetPos)
                            if (firstDefault.model) firstDefault.model.position.set(0, 0, 0)
                        }
                    } else {
                        console.warn('⚠️ No se encontró objeto portal en la escena para posicionar la moneda delante.')
                    }
                }
            } catch (e) {
                console.warn('⚠️ No se pudo mover la moneda al frente del portal al cargar nivel 2:', e)
            }

            this.totalDefaultCoins = this.loader.prizes.filter(p => p.role === "default").length;
            console.log(`🎯 Total de monedas default para el nivel ${level}: ${this.totalDefaultCoins}`);

            this.resetRobotPosition(spawnPoint);
            
            // Spawn enemigos según el nivel
            const enemiesCount = level === 1 ? 1 : level === 2 ? 3 : 5;
            this.spawnEnemies(enemiesCount);
            
            // Dar tiempo para que el jugador se oriente antes de activar enemigos
            this.gameStarted = false;
            setTimeout(() => {
                this.gameStarted = true;
                console.log('🎮 Enemigos activados');
            }, 2000);
            
            console.log(`✅ Nivel ${level} cargado con spawn en`, spawnPoint, `y ${enemiesCount} enemigos`);
        } catch (error) {
            console.error('❌ Error cargando nivel:', error);
        }
    }

    clearCurrentScene() {
        if (!this.experience || !this.scene || !this.experience.physics || !this.experience.physics.world) {
            console.warn('⚠️ No se puede limpiar: sistema de físicas no disponible.');
            return;
        }

        let visualObjectsRemoved = 0;
        let physicsBodiesRemoved = 0;

        const childrenToRemove = [];

        this.scene.children.forEach((child) => {
            if (child.userData && child.userData.levelObject) {
                childrenToRemove.push(child);
            }
        });

        childrenToRemove.forEach((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }

            this.scene.remove(child);

            if (child.userData.physicsBody) {
                this.experience.physics.world.removeBody(child.userData.physicsBody);
            }

            visualObjectsRemoved++;
        });

        let physicsBodiesRemaining = -1;

        if (this.experience.physics && this.experience.physics.world && Array.isArray(this.experience.physics.bodies)) {
            const survivingBodies = [];
            let bodiesBefore = this.experience.physics.bodies.length;

            this.experience.physics.bodies.forEach((body) => {
                if (body.userData && body.userData.levelObject) {
                    this.experience.physics.world.removeBody(body);
                    physicsBodiesRemoved++;
                } else {
                    survivingBodies.push(body);
                }
            });

            this.experience.physics.bodies = survivingBodies;

            console.log(`🧹 Physics Cleanup Report:`);
            console.log(`✅ Cuerpos físicos eliminados: ${physicsBodiesRemoved}`);
            console.log(`🎯 Cuerpos físicos sobrevivientes: ${survivingBodies.length}`);
            console.log(`📦 Estado inicial: ${bodiesBefore} cuerpos → Estado final: ${survivingBodies.length} cuerpos`);
        } else {
            console.warn('⚠️ Physics system no disponible o sin cuerpos activos, omitiendo limpieza física.');
        }

        console.log(`🧹 Escena limpiada antes de cargar el nuevo nivel.`);
        console.log(`✅ Objetos 3D eliminados: ${visualObjectsRemoved}`);
        console.log(`✅ Cuerpos físicos eliminados: ${physicsBodiesRemoved}`);
        console.log(`🎯 Objetos 3D actuales en escena: ${this.scene.children.length}`);

        // 🔥 IMPORTANTE: Limpiar array de prizes para evitar conflictos entre niveles
        if (this.loader && this.loader.prizes && this.loader.prizes.length > 0) {
            console.log(`🪙 Limpiando ${this.loader.prizes.length} monedas del nivel anterior`);
            
            // Eliminar pivots de la escena
            this.loader.prizes.forEach(prize => {
                if (prize.pivot) {
                    this.scene.remove(prize.pivot);
                    
                    // Limpiar geometrías y materiales
                    prize.pivot.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => mat.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                }
            });
            
            this.loader.prizes = [];
        }

        // 🔥 IMPORTANTE: Limpiar enemigos
        if (this.enemies?.length) {
            console.log(`👾 Limpiando ${this.enemies.length} enemigos del nivel anterior`);
            this.enemies.forEach(e => e?.remove?.());
            this.enemies = [];
        }

        if (physicsBodiesRemaining !== -1) {
            console.log(`🎯 Cuerpos físicos actuales en Physics World: ${physicsBodiesRemaining}`);
        }

        // Resetear flag de portal
        this.finalPrizeActivated = false


        /** Esto es de faro para limpienza */
        if (this.discoRaysGroup) {
            this.discoRaysGroup.children.forEach(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
            this.scene.remove(this.discoRaysGroup);
            this.discoRaysGroup = null;
        }

        /** Fin faro para limpianza */

    }

    resetRobotPosition(spawn = { x: -17, y: 1.5, z: -67 }) {
        if (!this.robot?.body || !this.robot?.group) return

        this.robot.body.position.set(spawn.x, spawn.y, spawn.z)
        this.robot.body.velocity.set(0, 0, 0)
        this.robot.body.angularVelocity.set(0, 0, 0)
        this.robot.body.quaternion.setFromEuler(0, 0, 0)

        this.robot.group.position.set(spawn.x, spawn.y, spawn.z)
        this.robot.group.rotation.set(0, 0, 0)
    }

    async _processLocalBlocks(blocks) {
        const preciseRes = await fetch('/config/precisePhysicsModels.json');
        const preciseModels = await preciseRes.json();
        this.loader._processBlocks(blocks, preciseModels);

        this.loader.prizes.forEach(p => {
            if (p.model) p.model.visible = (p.role !== 'finalPrize');
            p.collected = false;
        });

        this.totalDefaultCoins = this.loader.prizes.filter(p => p.role === "default").length;
        console.log(`🎯 Total de monedas default para el nivel local: ${this.totalDefaultCoins}`);
    }

    _checkVRMode() {
        const isVR = this.experience.renderer.instance.xr.isPresenting

        if (isVR) {
            if (this.robot?.group) {
                this.robot.group.visible = false
            }

            // 🔁 Delay de 3s para que no ataque de inmediato en VR
            if (this.enemy) {
                this.enemy.delayActivation = 10.0
            }

            // 🧠 Posicionar cámara correctamente
            this.experience.camera.instance.position.set(5, 1.6, 5)
            this.experience.camera.instance.lookAt(new THREE.Vector3(5, 1.6, 4))
        } else {
            if (this.robot?.group) {
                this.robot.group.visible = true
            }
        }
    }


}