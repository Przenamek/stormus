export default class ScrapItem extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type) {
        super(scene, x, y);
        this.scene = scene;
        this.itemType = type; // 'A', 'B', 'C' lub 'GRUZ'
        
        let color = 0xffffff;
        let label = '';
        let width = 50;
        let height = 50;

        switch(type) {
            case 'A':
                color = 0x4CAF50; // Zielony
                label = 'A';
                break;
            case 'B':
                color = 0xFFEB3B; // Żółty
                label = 'B';
                break;
            case 'C':
                color = 0xF44336; // Czerwony
                label = 'C';
                break;
            case 'GRUZ':
                color = 0x9E9E9E; // Szary
                label = 'GRUZ';
                width = 80;
                height = 40;
                break;
        }

        this.bgRect = scene.add.rectangle(0, 0, width, height, color);
        
        // Zmiana koloru tekstu dla lepszej widoczności na B
        const textColor = type === 'B' ? '#000000' : '#ffffff';
        this.textLabel = scene.add.text(0, 0, label, {
            fontSize: type === 'GRUZ' ? '18px' : '24px',
            fill: textColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add([this.bgRect, this.textLabel]);
        this.scene.add.existing(this);

        this.scene.physics.add.existing(this);
        this.body.setSize(width, height);
        this.body.setOffset(-width/2, -height/2);
    }
}
