import Machine from '../objects/Machine.js';

export default class CleanerScene extends Phaser.Scene {
    constructor() {
        super('CleanerScene');
    }

    init(data) {
        this.runnerScore = data.runnerScore || 0;
        this.cleanerScore = 0;
        this.wsady = 0;
        this.timeLeft = 60;
        this.gridSize = 8;
        this.tileSize = 110;
        
        // Player state
        this.playerPos = { x: 1, y: 4 };
        this.heldItem = null; // { type: 'CLEAN'|'RUBBER'|... }
        this.facing = { x: 0, y: 1 }; // Initially facing down
        
        // Game state
        this.itemsOnBelt = [];
        this.spawnTimer = 3000;
        this.currentSpawnDelay = 3000;
        this.elapsedTime = 0;
        
        // Board layout
        this.blaty = new Map(); // 'x,y' -> item
        this.machines = new Map(); // 'x,y' -> machine instance
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Draw Grid and Belt
        this.drawGrid();

        // Setup Machines
        this.setupMachines();

        // Setup Player
        this.player = this.add.circle(0, 0, 40, 0xffffff).setStrokeStyle(4, 0x333333);
        this.heldItemSprite = this.add.rectangle(20, -20, 24, 24, 0x000000).setVisible(false);
        // Triangle indicator for direction (15px)
        this.directionIndicator = this.add.triangle(0, 0, 0, -42, 7.5, -27, -7.5, -27, 0xff0000);
        
        this.playerContainer = this.add.container(0, 0, [this.player, this.heldItemSprite, this.directionIndicator]);
        this.updatePlayerVisualPosition();

        // UI
        this.setupUI();

        // Controls
        this.setupControls();

        // Timers
        this.time.addEvent({
            delay: 1000,
            callback: this.tick,
            callbackScope: this,
            loop: true
        });
    }

    drawGrid() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const px = x * this.tileSize + this.tileSize / 2;
                const py = y * this.tileSize + this.tileSize / 2;
                
                let color = 0x333344; // Default floor
                
                // Conveyor Belt (L-shape)
                if (x === 0 || (y === 7 && x > 0)) {
                    color = 0x5d4037; // Brown belt
                } else if (x === 7 && y === 0) {
                    color = 0x2196F3; // Blue skup
                } else if (this.isBlat(x, y)) {
                    color = 0x795548; // Lighter brown for counters
                }

                this.add.rectangle(px, py, this.tileSize - 4, this.tileSize - 4, color).setOrigin(0.5);
            }
        }
    }

    isBlat(x, y) {
        const blatyCoords = [[6,0], [3,1], [4,1], [4,2], [4,3]];
        return blatyCoords.some(c => c[0] === x && c[1] === y);
    }

    setupMachines() {
        const machineData = [
            { x: 1, y: 0, type: 'OPON' },
            { x: 7, y: 2, type: 'BETON' },
            { x: 7, y: 3, type: 'DREWNO' },
            { x: 3, y: 3, type: 'SPAWARKA' }
        ];

        machineData.forEach(data => {
            const m = new Machine(this, data.x * this.tileSize + this.tileSize / 2, data.y * this.tileSize + this.tileSize / 2, data.type);
            this.machines.set(`${data.x},${data.y}`, m);
        });
    }

    setupUI() {
        this.uiBg = this.add.rectangle(0, 0, this.cameras.main.width, 40, 0x000000).setOrigin(0).setAlpha(0.8);
        this.timerText = this.add.text(20, 10, `Czas: ${this.timeLeft}s`, { fontSize: '20px', fill: '#fff' });
        this.wsadyText = this.add.text(this.cameras.main.width / 2, 10, `Wsady: ${this.wsady}/8`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.cameras.main.width - 20, 10, `Punkty: ${this.cleanerScore}`, { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,ALT');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.input.keyboard.on('keydown', (event) => {
            if (this.timeLeft <= 0) return;

            let move = { x: 0, y: 0 };
            let isAlt = this.keys.ALT.isDown;
            let step = isAlt ? 2 : 1;

            if (event.code === 'ArrowUp' || event.code === 'KeyW') move.y = -step;
            else if (event.code === 'ArrowDown' || event.code === 'KeyS') move.y = step;
            else if (event.code === 'ArrowLeft' || event.code === 'KeyA') move.x = -step;
            else if (event.code === 'ArrowRight' || event.code === 'KeyD') move.x = step;
            
            if (move.x !== 0 || move.y !== 0) {
                this.tryMove(move.x, move.y);
            }

            if (event.code === 'Space' || event.key === ' ') {
                this.handleInteraction();
                event.preventDefault();
            }
        });
    }

    tryMove(dx, dy) {
        let newX = this.playerPos.x + dx;
        let newY = this.playerPos.y + dy;

        // Update facing direction ALWAYS, even if we don't move
        if (dx !== 0) this.facing = { x: Math.sign(dx), y: 0 };
        else if (dy !== 0) this.facing = { x: 0, y: Math.sign(dy) };

        // Bounds check
        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            // Check if blocked by machine, belt, skup or blat
            if (this.isWalkable(newX, newY)) {
                this.playerPos.x = newX;
                this.playerPos.y = newY;
            }
        }
        
        this.updatePlayerVisualPosition();
    }

    isWalkable(x, y) {
        // Not walkable if:
        // 1. Machine
        if (this.machines.has(`${x},${y}`)) return false;
        // 2. Belt
        if (x === 0 || (y === 7 && x > 0)) return false;
        // 3. Skup
        if (x === 7 && y === 0) return false;
        // 4. Blat
        if (this.isBlat(x, y)) return false;

        return true;
    }

    updatePlayerVisualPosition() {
        this.playerContainer.x = this.playerPos.x * this.tileSize + this.tileSize / 2;
        this.playerContainer.y = this.playerPos.y * this.tileSize + this.tileSize / 2;
        
        // Rotate indicator based on facing
        if (this.facing.x === 1) this.directionIndicator.setAngle(90);
        else if (this.facing.x === -1) this.directionIndicator.setAngle(-90);
        else if (this.facing.y === 1) this.directionIndicator.setAngle(180);
        else if (this.facing.y === -1) this.directionIndicator.setAngle(0);
    }

    handleInteraction() {
        // Target cell in front of player
        const targetX = this.playerPos.x + this.facing.x;
        const targetY = this.playerPos.y + this.facing.y;
        const key = `${targetX},${targetY}`;

        // 1. Check for machine interaction
        if (this.machines.has(key)) {
            const machine = this.machines.get(key);
            
            if (machine.state === 'READY') {
                // Take item from machine
                const itemType = machine.takeItem();
                this.dropCurrentItemIfHeld(); // On MVP: simple replace if logic requires, but DoD says "odkłada na blat jeśli jest miejsce". Simplifying for now: if held, can't take.
                if (!this.heldItem) {
                    this.pickUpItem(itemType);
                }
            } else if (machine.state === 'IDLE' && this.heldItem) {
                // Give item to machine
                if (machine.canAccept(this.heldItem.type)) {
                    machine.inputItem();
                    this.heldItem = null;
                    this.heldItemSprite.setVisible(false);
                } else {
                    machine.breakDown();
                }
            }
            return;
        }

        // 2. Check for belt interaction
        if (targetX === 0 || (targetY === 7 && targetX > 0)) {
            if (!this.heldItem) {
                // Try pick up from belt
                const itemIndex = this.itemsOnBelt.findIndex(i => i.gridX === targetX && i.gridY === targetY);
                if (itemIndex !== -1) {
                    const item = this.itemsOnBelt[itemIndex];
                    this.pickUpItem(item.type);
                    item.sprite.destroy();
                    this.itemsOnBelt.splice(itemIndex, 1);
                }
            }
            return;
        }

        // 3. Check for Skup interaction
        if (targetX === 7 && targetY === 0) {
            if (this.heldItem && this.heldItem.type === 'GRUDA') {
                this.wsady++;
                this.cleanerScore += 200;
                this.heldItem = null;
                this.heldItemSprite.setVisible(false);
                this.updateUI();
            }
            return;
        }

        // 4. Check for Blat interaction
        if (this.isBlat(targetX, targetY)) {
            if (this.heldItem) {
                if (!this.blaty.has(key)) {
                    // Put on blat
                    const sprite = this.add.rectangle(targetX * this.tileSize + this.tileSize / 2, targetY * this.tileSize + this.tileSize / 2, 40, 40, this.getItemColor(this.heldItem.type));
                    this.blaty.set(key, { type: this.heldItem.type, sprite: sprite });
                    this.heldItem = null;
                    this.heldItemSprite.setVisible(false);
                }
            } else {
                if (this.blaty.has(key)) {
                    // Pick up from blat
                    const item = this.blaty.get(key);
                    this.pickUpItem(item.type);
                    item.sprite.destroy();
                    this.blaty.delete(key);
                }
            }
            return;
        }
    }

    pickUpItem(type) {
        this.heldItem = { type: type };
        this.heldItemSprite.setFillStyle(this.getItemColor(type));
        this.heldItemSprite.setVisible(true);
    }

    dropCurrentItemIfHeld() {
        // Implementation for automatic drop if needed, but per DOD we just manage manually.
    }

    getItemColor(type) {
        switch(type) {
            case 'CLEAN': return 0x4CAF50;
            case 'RUBBER': return 0x555555;
            case 'CONCRETE': return 0xCCCCCC;
            case 'WOOD': return 0xFF9800;
            case 'GRUDA': return 0xFFD700;
            default: return 0xffffff;
        }
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateUI();
            
            // Speed up spawn
            this.elapsedTime += 1000;
            if (this.elapsedTime % 20000 === 0) {
                this.currentSpawnDelay = Math.max(1500, this.currentSpawnDelay - 300);
            }

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }
    }

    updateUI() {
        this.timerText.setText(`Czas: ${this.timeLeft}s`);
        this.wsadyText.setText(`Wsady: ${this.wsady}/8`);
        this.scoreText.setText(`Punkty: ${this.cleanerScore}`);
    }

    spawnBeltItem() {
        const types = ['RUBBER', 'CONCRETE', 'WOOD', 'CLEAN'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const sprite = this.add.rectangle(this.tileSize / 2, this.tileSize / 2, 40, 40, this.getItemColor(type)).setDepth(5);
        
        this.itemsOnBelt.push({
            gridX: 0,
            gridY: 0,
            type: type,
            sprite: sprite
        });
    }

    update(time, delta) {
        if (this.timeLeft <= 0) return;

        // Spawn items
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
            this.spawnBeltItem();
            this.spawnTimer = this.currentSpawnDelay;
        }

        // Update items on belt
        // For MVP, move items every second or smoothly? 
        // Let's move them smoothly for a better look.
        const moveSpeed = delta * 0.002; // Grid units per ms
        
        for (let i = this.itemsOnBelt.length - 1; i >= 0; i--) {
            const item = this.itemsOnBelt[i];
            
            if (item.gridX === 0 && item.gridY < 7) {
                item.gridY += moveSpeed;
            } else if (item.gridY >= 7 && item.gridX < 7.5) {
                item.gridY = 7;
                item.gridX += moveSpeed;
            } else {
                // Fell off belt
                item.sprite.destroy();
                this.itemsOnBelt.splice(i, 1);
                continue;
            }
            
            item.sprite.x = item.gridX * this.tileSize + this.tileSize / 2;
            item.sprite.y = item.gridY * this.tileSize + this.tileSize / 2;
        }

        // Update machines
        this.machines.forEach(m => m.update(time, delta));
    }

    endGame() {
        let stars = 0;
        if (this.wsady >= 12) stars = 3;
        else if (this.wsady >= 10) stars = 2;
        else if (this.wsady >= 8) stars = 1;

        this.scene.start('ResultScene', {
            runnerScore: this.runnerScore,
            cleanerScore: this.cleanerScore,
            wsady: this.wsady,
            stars: stars
        });
    }
}
