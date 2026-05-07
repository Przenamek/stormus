export default class Machine extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type) {
        super(scene, x, y);
        this.scene = scene;
        this.machineType = type; // 'OPON', 'BETON', 'DREWNO', 'SPAWARKA'
        this.state = 'IDLE'; // 'IDLE', 'WORKING', 'READY', 'BROKEN'
        this.progress = 0;
        this.spawarkaCount = 0;
        this.brokenTimer = 0;
        this.workingTime = type === 'SPAWARKA' ? 6000 : 4000;

        let color = 0x000000;
        let label = '';
        switch(type) {
            case 'OPON': color = 0x000000; label = 'OPONY'; break;
            case 'BETON': color = 0xFFFFFF; label = 'BETON'; break;
            case 'DREWNO': color = 0xFFFF00; label = 'DREWNO'; break;
            case 'SPAWARKA': color = 0xFF0000; label = 'SPAW'; break;
        }

        // Main body
        this.bg = scene.add.rectangle(0, 0, 100, 100, color).setStrokeStyle(4, 0x333333);
        
        // Label
        const textColor = (type === 'BETON' || type === 'DREWNO') ? '#000000' : '#ffffff';
        this.title = scene.add.text(0, -20, label, { fontSize: '16px', fill: textColor, fontStyle: 'bold' }).setOrigin(0.5);
        
        // Counter for Spawarka
        this.counterText = scene.add.text(0, 10, '', { fontSize: '20px', fill: textColor, fontStyle: 'bold' }).setOrigin(0.5);
        if (type === 'SPAWARKA') this.counterText.setText('0/3');

        // Progress bar container
        this.progressBarBg = scene.add.rectangle(0, -60, 100, 10, 0x333333).setVisible(false);
        this.progressBar = scene.add.rectangle(-50, -60, 0, 10, 0x00ff00).setOrigin(0, 0.5).setVisible(false);

        // Broken "X"
        this.brokenX = scene.add.text(0, 0, 'X', { fontSize: '64px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);

        this.add([this.bg, this.title, this.counterText, this.progressBarBg, this.progressBar, this.brokenX]);
        scene.add.existing(this);
    }

    canAccept(itemType) {
        if (this.state !== 'IDLE') return false;
        
        switch(this.machineType) {
            case 'OPON': return itemType === 'RUBBER';
            case 'BETON': return itemType === 'CONCRETE';
            case 'DREWNO': return itemType === 'WOOD';
            case 'SPAWARKA': return itemType === 'CLEAN';
            default: return false;
        }
    }

    inputItem() {
        if (this.machineType === 'SPAWARKA') {
            this.spawarkaCount++;
            this.counterText.setText(`${this.spawarkaCount}/3`);
            if (this.spawarkaCount >= 3) {
                this.startWorking();
            }
        } else {
            this.startWorking();
        }
    }

    breakDown() {
        this.state = 'BROKEN';
        this.brokenTimer = 4000;
        this.bg.setFillStyle(0xff0000, 0.5);
        this.brokenX.setVisible(true);
        this.progressBar.setVisible(false);
        this.progressBarBg.setVisible(false);
        this.counterText.setText('');
    }

    startWorking() {
        this.state = 'WORKING';
        this.progress = 0;
        this.progressBar.width = 0;
        this.progressBar.setVisible(true);
        this.progressBarBg.setVisible(true);
        if (this.machineType === 'SPAWARKA') this.counterText.setText('3/3 ▶');
    }

    update(time, delta) {
        if (this.state === 'WORKING') {
            this.progress += delta / this.workingTime;
            this.progressBar.width = Math.min(this.progress, 1) * 100;
            
            // Pulsing effect
            this.bg.setAlpha(0.7 + Math.sin(time / 100) * 0.3);

            if (this.progress >= 1) {
                this.state = 'READY';
                this.bg.setAlpha(1);
                this.progressBar.setFillStyle(0x00ff00);
            }
        } else if (this.state === 'READY') {
            // Miga zielono
            const flash = Math.floor(time / 200) % 2 === 0;
            this.progressBar.setVisible(flash);
        } else if (this.state === 'BROKEN') {
            this.brokenTimer -= delta;
            if (this.brokenTimer <= 0) {
                this.reset();
            }
        }
    }

    reset() {
        this.state = 'IDLE';
        this.progress = 0;
        this.spawarkaCount = 0;
        this.brokenX.setVisible(false);
        this.progressBar.setVisible(false);
        this.progressBarBg.setVisible(false);
        this.bg.setAlpha(1);
        
        let color = 0x000000;
        switch(this.machineType) {
            case 'OPON': color = 0x000000; break;
            case 'BETON': color = 0xFFFFFF; break;
            case 'DREWNO': color = 0xFFFF00; break;
            case 'SPAWARKA': color = 0xFF0000; break;
        }
        this.bg.setFillStyle(color);
        if (this.machineType === 'SPAWARKA') this.counterText.setText('0/3');
    }

    takeItem() {
        const type = this.machineType === 'SPAWARKA' ? 'GRUDA' : 'CLEAN';
        this.reset();
        return type;
    }
}
