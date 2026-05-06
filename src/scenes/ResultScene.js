export default class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');
    }

    init(data) {
        this.scoreA = data.scoreA || 0;
        this.scoreB = data.scoreB || 0;
        this.scoreC = data.scoreC || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Tło
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        this.add.text(width / 2, height * 0.2, 'KONIEC RUNDY', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Podsumowanie
        const startY = height * 0.35;
        const spacing = 40;

        this.add.text(width / 2, startY, `Złom A: ${this.scoreA} x 100 pkt`, { fontSize: '24px', fill: '#4CAF50' }).setOrigin(0.5);
        this.add.text(width / 2, startY + spacing, `Złom B: ${this.scoreB} x 60 pkt`, { fontSize: '24px', fill: '#FFEB3B' }).setOrigin(0.5);
        this.add.text(width / 2, startY + spacing * 2, `Złom C: ${this.scoreC} x (-20) pkt`, { fontSize: '24px', fill: '#F44336' }).setOrigin(0.5);

        const totalScore = (this.scoreA * 100) + (this.scoreB * 60) - (this.scoreC * 20);

        this.add.text(width / 2, startY + spacing * 4, `WYNIK: ${totalScore}`, {
            fontSize: '40px',
            fontFamily: 'Arial',
            fill: '#ff9900',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Przyciski
        const createButton = (x, y, text, color, hoverColor, callback) => {
            const btn = this.add.rectangle(x, y, 250, 50, color).setInteractive();
            this.add.text(x, y, text, { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
            btn.on('pointerdown', callback);
            btn.on('pointerover', () => btn.setFillStyle(hoverColor));
            btn.on('pointerout', () => btn.setFillStyle(color));
        };

        createButton(width / 2, height * 0.75, 'NASTĘPNA RUNDA', 0x4CAF50, 0x45a049, () => {
            this.scene.start('RunnerScene');
        });

        createButton(width / 2, height * 0.85, 'MENU', 0x9E9E9E, 0x757575, () => {
            this.scene.start('MenuScene');
        });
    }
}
