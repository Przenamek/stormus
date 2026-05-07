import Stormus from '../objects/Stormus.js';
import ScrapItem from '../objects/ScrapItem.js';

export default class RunnerScene extends Phaser.Scene {
    constructor() {
        super('RunnerScene');
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        // Statystyki
        this.scores = { A: 0, B: 0, C: 0 };
        this.timeLeft = 60;
        this.gameSpeed = 300; // px/s przesuwania elementów

        // Tło
        this.add.rectangle(0, 0, this.width, this.height, 0x111122).setOrigin(0);

        // Obliczanie torów
        const laneWidth = this.width / 3;
        this.lanes = [
            laneWidth / 2,
            laneWidth * 1.5,
            laneWidth * 2.5
        ];

        // Rysowanie linii torów
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x333355, 1);
        graphics.beginPath();
        graphics.moveTo(laneWidth, 0);
        graphics.lineTo(laneWidth, this.height);
        graphics.moveTo(laneWidth * 2, 0);
        graphics.lineTo(laneWidth * 2, this.height);
        graphics.strokePath();

        // Grupy obiektów
        this.itemsGroup = this.physics.add.group();

        // Gracz
        this.player = new Stormus(this, this.lanes[1], this.height - 150, this.lanes);

        // UI
        this.uiBg = this.add.rectangle(0, 0, this.width, 40, 0x000000).setOrigin(0).setAlpha(0.7);
        this.bagText = this.add.text(10, 10, 'Worek: A:0 B:0 C:0', { fontSize: '18px', fill: '#fff', fontStyle: 'bold' });
        this.timerText = this.add.text(this.width - 10, 10, 'Czas: 60s', { fontSize: '18px', fill: '#fff', fontStyle: 'bold' }).setOrigin(1, 0);

        // Sterowanie
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Touch (swipe and tap)
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointerup', this.handlePointerUp, this);

        // Generator elementów
        this.spawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(800, 1200),
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        });

        // Timer rundy
        this.roundTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Kolizje
        this.physics.add.overlap(this.player, this.itemsGroup, this.handleCollision, null, this);
    }

    handlePointerDown(pointer) {
        this.touchStartX = pointer.x;
        this.touchStartY = pointer.y;
    }

    handlePointerUp(pointer) {
        const dx = pointer.x - this.touchStartX;
        const dy = pointer.y - this.touchStartY;

        if (Math.abs(dx) > 50) { // swipe horizontal
            if (dx > 0) this.player.moveRight();
            else this.player.moveLeft();
        } else if (Math.abs(dy) > 50) { // swipe vertical
            if (dy > 0) this.player.slide();
            // nie obsługujemy swipe up dla jump domyślnie, tap jest do tego
        } else { // tap
            this.player.jump();
        }
    }

    spawnItem() {
        // Losowy tor
        const laneIndex = Phaser.Math.Between(0, 2);
        const x = this.lanes[laneIndex];
        
        // Losowy typ
        const rand = Math.random();
        let type = 'A';
        if (rand > 0.85) type = 'GRUZ';
        else if (rand > 0.6) type = 'C';
        else if (rand > 0.3) type = 'B';
        
        const item = new ScrapItem(this, x, -50, type);
        this.itemsGroup.add(item);
        item.body.setVelocityY(this.gameSpeed);

        // Resetowanie timera na nową wartość losową
        this.spawnTimer.delay = Phaser.Math.Between(800, 1200);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(`Czas: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
            this.endRound();
        }
    }

    handleCollision(player, item) {
        if (item.itemType === 'GRUZ') {
            if (!this.player.isStunned) {
                this.player.stun();
            }
        } else {
            // Zbieranie przedmiotu
            this.scores[item.itemType]++;
            this.updateBagUI();
        }
        
        item.destroy();
    }

    updateBagUI() {
        this.bagText.setText(`Worek: A:${this.scores.A} B:${this.scores.B} C:${this.scores.C}`);
    }

    update() {
        // Sterowanie klawiaturą (z drobnym cooldownem, by nie skakał za szybko,
        // Phaser JustDown pomaga uchwycić pojedyncze wciśnięcie).
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.player.moveLeft();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.player.moveRight();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.player.jump();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.player.slide();
        }

        // Usuwanie elementów poza ekranem
        this.itemsGroup.children.iterate((child) => {
            if (child && child.y > this.height + 100) {
                child.destroy();
            }
        });
    }

    endRound() {
        this.scene.start('ResultScene', { 
            scoreA: this.scores.A, 
            scoreB: this.scores.B, 
            scoreC: this.scores.C 
        });
    }
}
