export default class LevelManager {
    constructor(experience) {
        this.experience = experience;
        this.currentLevel = 1;  // Inicias en el nivel 1
        this.totalLevels = 3;   // Total de niveles (ajustado a 3)
        // Definir objetivos de monedas por nivel
        this.pointsToComplete = {
            1: 2, // por defecto (puedes ajustarlo si quieres)
            2: 5,
            3: 3
        };
    }

    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            console.log(`🎮 Cambiando a nivel ${this.currentLevel}`);
            
            // Resetear variables importantes
            this.experience.world.levelProgressing = false;
            this.experience.world.finalPrizeActivated = false;
            this.experience.world.defeatTriggered = false;
            this.experience.world.gameStarted = false;
            
            // Limpiar y cargar nuevo nivel
            this.experience.world.clearCurrentScene();
            this.experience.world.loadLevel(this.currentLevel);
        }
    }
    

    resetLevel() {
        this.currentLevel = 1;
        this.experience.world.loadLevel(this.currentLevel);
    }


    getCurrentLevelTargetPoints() {
        return this.pointsToComplete?.[this.currentLevel] ?? 2;
    }
    
}
