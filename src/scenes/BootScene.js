export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('spaw-idle', 'assets/sprites/brak-spawania.png');
        this.load.image('spaw-working', 'assets/sprites/spawanie.png');
        this.load.image('stormus-left', 'assets/sprites/left.png');
        this.load.image('stormus-right', 'assets/sprites/right.png');
        this.load.image('stormus-up', 'assets/sprites/up.png');
        this.load.image('stormus-down', 'assets/sprites/down.png');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
