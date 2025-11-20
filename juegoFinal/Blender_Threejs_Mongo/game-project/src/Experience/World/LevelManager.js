export default class LevelManager {
    constructor(experience) {
        this.experience = experience;
        this.currentLevel = 1;  // Inicias en el nivel 1
        this.totalLevels = 3;   // Total de niveles (ajustado a 3)
        // ⭐ Definir objetivos de monedas por nivel
        // IMPORTANTE: Cambia estos números para ajustar cuántas monedas necesitas recoger
        this.pointsToComplete = {
            1: 2, // Nivel 1: 2 monedas para activar portal
            2: 5, // Nivel 2: 2 monedas para activar portal
            3: 2  // Nivel 3: 2 monedas para activar portal
        };
    }

    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            // Guardar nivel previo para que el World pueda reaccionar al cambio
            if (this.experience && this.experience.world) {
                this.experience.world.previousLevel = this.currentLevel
            }
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
