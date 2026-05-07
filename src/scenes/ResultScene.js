export default class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');
    }

    init(data) {
        this.runnerScore = data.runnerScore || 0;
        this.cleanerScore = data.cleanerScore || 0;
        this.wsady = data.wsady || 0;
        this.stars = data.stars || 0;
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

        this.add.text(width / 2, startY, `Wynik biegu: ${this.runnerScore} pkt`, { fontSize: '28px', fill: '#4CAF50' }).setOrigin(0.5);
        this.add.text(width / 2, startY + spacing, `Wydane grudy: ${this.wsady} (${this.cleanerScore} pkt)`, { fontSize: '28px', fill: '#2196F3' }).setOrigin(0.5);
        
        let starsStr = '';
        for(let i=0; i<this.stars; i++) starsStr += '★';
        for(let i=this.stars; i<3; i++) starsStr += '☆';
        
        this.add.text(width / 2, startY + spacing * 2, `Gwiazdki: ${starsStr}`, { fontSize: '36px', fill: '#FFEB3B' }).setOrigin(0.5);

        const totalScore = this.runnerScore + this.cleanerScore;

        this.add.text(width / 2, startY + spacing * 4, `ŁĄCZNY WYNIK: ${totalScore}`, {
            fontSize: '48px',
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
