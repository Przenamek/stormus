export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Tło
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Tytuł
        this.add.text(width / 2, height * 0.3, 'STORMUŚ', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#ff9900',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Podtytuł
        this.add.text(width / 2, height * 0.45, 'Zbieraj złom dla Stormetu!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Przycisk Start
        const startBtn = this.add.rectangle(width / 2, height * 0.65, 200, 60, 0x4CAF50).setInteractive();
        this.add.text(width / 2, height * 0.65, 'START', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        startBtn.on('pointerdown', () => {
            this.scene.start('CleanerScene', { runnerScore: 0 });
        });
    }
}
