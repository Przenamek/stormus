export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Na MVP nie ładujemy zewnętrznych zasobów,
        // będziemy polegać na Phaser Graphics.
    }

    create() {
        this.scene.start('MenuScene');
    }
}
