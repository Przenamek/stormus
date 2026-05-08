export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('spaw-idle', 'assets/sprites/brak-spawania.png');
        this.load.image('spaw-working', 'assets/sprites/spawanie.png');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
