export default class Stormus extends Phaser.GameObjects.Container {
    constructor(scene, x, y, lanes) {
        super(scene, x, y);
        this.scene = scene;
        this.lanes = lanes;
        this.currentLane = 1; // Środkowy tor (0, 1, 2)
        this.isStunned = false;

        // Tworzenie grafiki dla Stormusia
        this.bgRect = scene.add.rectangle(0, 0, 60, 80, 0xff9900);
        this.label = scene.add.text(0, 0, 'STORMUŚ', {
            fontSize: '12px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add([this.bgRect, this.label]);
        this.scene.add.existing(this);

        // Ustawienia fizyki
        this.scene.physics.add.existing(this);
        this.body.setSize(60, 80);
        this.body.setOffset(-30, -40); // Wyśrodkowanie body dla Container
        this.body.setImmovable(true);
    }

    moveLeft() {
        if (this.currentLane > 0 && !this.isStunned) {
            this.currentLane--;
            this.updateLanePosition();
        }
    }

    moveRight() {
        if (this.currentLane < 2 && !this.isStunned) {
            this.currentLane++;
            this.updateLanePosition();
        }
    }

    updateLanePosition() {
        // Animacja zmiany toru
        this.scene.tweens.add({
            targets: this,
            x: this.lanes[this.currentLane],
            duration: 100,
            ease: 'Linear'
        });
    }

    jump() {
        if (this.isStunned) return;
        
        // Symulacja skoku (np. powiększenie przez chwilę i zignorowanie pewnych przeszkód można by dodać)
        this.scene.tweens.add({
            targets: this.bgRect,
            scaleX: 1.2,
            scaleY: 1.2,
            yoyo: true,
            duration: 250,
            onComplete: () => {
                this.bgRect.setScale(1);
            }
        });
    }

    slide() {
        if (this.isStunned) return;

        // Symulacja ślizgu
        this.scene.tweens.add({
            targets: this.bgRect,
            scaleY: 0.5,
            yoyo: true,
            duration: 400,
            onComplete: () => {
                this.bgRect.setScale(1);
            }
        });
    }

    stun() {
        if (this.isStunned) return;
        this.isStunned = true;

        this.bgRect.setFillStyle(0x555555); // Szary podczas stuna
        
        // Mruganie
        const blinkEvent = this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                this.alpha = this.alpha === 1 ? 0.5 : 1;
            },
            loop: true
        });

        // Koniec stuna po 2s
        this.scene.time.delayedCall(2000, () => {
            this.isStunned = false;
            this.bgRect.setFillStyle(0xff9900);
            this.alpha = 1;
            blinkEvent.remove();
        });
    }
}
