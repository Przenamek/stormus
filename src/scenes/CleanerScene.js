import Machine from '../objects/Machine.js';

const MOVE_INTERVAL = 150;

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
        
        // Input state
        this.activeKeys = [];
        this.lastMoveTime = 0;
        
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
        this.player = this.add.image(0, 0, 'stormus-down').setDisplaySize(110, 110);
        this.heldItemSprite = this.add.rectangle(20, -20, 24, 24, 0x000000).setVisible(false);
        
        this.playerContainer = this.add.container(0, 0, [this.player, this.heldItemSprite]);
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
                const py = y * this.tileSize + this.tileSize / 2 + 50;
                
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
            const m = new Machine(this, data.x * this.tileSize + this.tileSize / 2, data.y * this.tileSize + this.tileSize / 2 + 50, data.type);
            this.machines.set(`${data.x},${data.y}`, m);
        });
    }

    setupUI() {
        this.uiBg = this.add.rectangle(0, 0, this.cameras.main.width, 50, 0x000000).setOrigin(0).setAlpha(0.8);
        this.timerText = this.add.text(20, 15, `Czas: ${this.timeLeft}s`, { fontSize: '20px', fill: '#fff' });
        this.wsadyText = this.add.text(this.cameras.main.width / 2, 15, `Wsady: ${this.wsady}/8`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.cameras.main.width - 20, 15, `Punkty: ${this.cleanerScore}`, { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
    }

    setupControls() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        const keyMap = {
            'KeyW': 'UP', 'ArrowUp': 'UP',
            'KeyS': 'DOWN', 'ArrowDown': 'DOWN',
            'KeyA': 'LEFT', 'ArrowLeft': 'LEFT',
            'KeyD': 'RIGHT', 'ArrowRight': 'RIGHT'
        };

        this.input.keyboard.on('keydown', (event) => {
            if (this.timeLeft <= 0) return;

            if (event.code === 'Space' || event.key === ' ') {
                this.handleInteraction();
                event.preventDefault();
                return;
            }

            let mappedKey = keyMap[event.code];
            if (mappedKey && !this.activeKeys.includes(mappedKey)) {
                this.activeKeys.push(mappedKey);
                // Trigger immediate move if moving from idle
                if (this.activeKeys.length === 1 && this.time.now > this.lastMoveTime + MOVE_INTERVAL) {
                    this.executeMove(mappedKey);
                }
            }
        });

        this.input.keyboard.on('keyup', (event) => {
            let mappedKey = keyMap[event.code];
            if (mappedKey) {
                this.activeKeys = this.activeKeys.filter(k => k !== mappedKey);
            }
        });
    }

    executeMove(direction) {
        this.lastMoveTime = this.time.now;
        let dx = 0;
        let dy = 0;
        if (direction === 'UP') dy = -1;
        else if (direction === 'DOWN') dy = 1;
        else if (direction === 'LEFT') dx = -1;
        else if (direction === 'RIGHT') dx = 1;

        if (dx !== 0 || dy !== 0) {
            this.tryMove(dx, dy);
        }
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
                // Handle kicking items on the floor
                const targetKey = `${newX},${newY}`;
                if (this.blaty.has(targetKey)) {
                    let kickX = newX + dx;
                    let kickY = newY + dy;
                    if (kickX >= 0 && kickX < this.gridSize && kickY >= 0 && kickY < this.gridSize) {
                        let canKickHere = (this.isWalkable(kickX, kickY) || this.isBlat(kickX, kickY)) && !this.blaty.has(`${kickX},${kickY}`);
                        if (canKickHere) {
                            let item = this.blaty.get(targetKey);
                            this.blaty.delete(targetKey);
                            this.blaty.set(`${kickX},${kickY}`, item);
                            item.sprite.x = kickX * this.tileSize + this.tileSize / 2;
                            item.sprite.y = kickY * this.tileSize + this.tileSize / 2 + 50;
                        }
                    }
                }
                
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
        this.playerContainer.y = this.playerPos.y * this.tileSize + this.tileSize / 2 + 50;
        
        // Update player sprite based on facing direction
        if (this.facing.x === 1) {
            this.player.setTexture('stormus-right');
            this.heldItemSprite.setPosition(40, 0);
        } else if (this.facing.x === -1) {
            this.player.setTexture('stormus-left');
            this.heldItemSprite.setPosition(-40, 0);
        } else if (this.facing.y === 1) {
            this.player.setTexture('stormus-down');
            this.heldItemSprite.setPosition(0, 40);
        } else if (this.facing.y === -1) {
            this.player.setTexture('stormus-up');
            this.heldItemSprite.setPosition(0, -40);
        }
    }

    handleInteraction() {
        // Target cell in front of player
        const targetX = this.playerPos.x + this.facing.x;
        const targetY = this.playerPos.y + this.facing.y;
        const key = `${targetX},${targetY}`;

        // DEBUG: Check cell type in front
        let cellType = 'OUT_OF_BOUNDS';
        if (targetX >= 0 && targetX < this.gridSize && targetY >= 0 && targetY < this.gridSize) {
            if (this.machines.has(key)) cellType = 'MACHINE';
            else if (targetX === 0 || (targetY === 7 && targetX > 0)) cellType = 'BELT';
            else if (targetX === 7 && targetY === 0) cellType = 'SKUP';
            else if (this.isBlat(targetX, targetY)) cellType = 'BLAT';
            else cellType = 'FLOOR';
        }

        console.log(`[SPACJA] Pos:(${this.playerPos.x},${this.playerPos.y}) Dir:(${this.facing.x},${this.facing.y}) Target:(${targetX},${targetY}) Type:${cellType} Held:${this.heldItem ? this.heldItem.type : 'null'}`);

        if (targetX < 0 || targetX >= this.gridSize || targetY < 0 || targetY >= this.gridSize) return;

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
                // Try pick up from belt - comparing grid indices (rounded)
                const itemIndex = this.itemsOnBelt.findIndex(i => 
                    Math.round(i.gridX) === targetX && Math.round(i.gridY) === targetY
                );
                if (itemIndex !== -1) {
                    const item = this.itemsOnBelt[itemIndex];
                    this.pickUpItem(item.type);
                    item.sprite.destroy();
                    this.itemsOnBelt.splice(itemIndex, 1);
                }
            } else {
                // Put item on belt
                const sprite = this.add.rectangle(targetX * this.tileSize + this.tileSize / 2, targetY * this.tileSize + this.tileSize / 2 + 50, 40, 40, this.getItemColor(this.heldItem.type)).setDepth(5);
                this.itemsOnBelt.push({
                    gridX: targetX,
                    gridY: targetY,
                    type: this.heldItem.type,
                    sprite: sprite
                });
                this.heldItem = null;
                this.heldItemSprite.setVisible(false);
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

        // 4. Check for Blat or Floor interaction
        if (this.isBlat(targetX, targetY) || this.isWalkable(targetX, targetY)) {
            if (this.heldItem) {
                if (!this.blaty.has(key)) {
                    // Put on blat or floor
                    const sprite = this.add.rectangle(targetX * this.tileSize + this.tileSize / 2, targetY * this.tileSize + this.tileSize / 2 + 50, 40, 40, this.getItemColor(this.heldItem.type));
                    this.blaty.set(key, { type: this.heldItem.type, sprite: sprite });
                    this.heldItem = null;
                    this.heldItemSprite.setVisible(false);
                }
            } else {
                if (this.blaty.has(key)) {
                    // Pick up from blat or floor
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
            case 'RUBBER': return 0x000000;
            case 'CONCRETE': return 0xFFFFFF;
            case 'WOOD': return 0xFFFF00;
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
        const sprite = this.add.rectangle(this.tileSize / 2, this.tileSize / 2 + 50, 40, 40, this.getItemColor(type)).setDepth(5);
        
        this.itemsOnBelt.push({
            gridX: 0,
            gridY: 0,
            type: type,
            sprite: sprite
        });
    }

    update(time, delta) {
        if (this.timeLeft <= 0) return;

        // Smooth movement polling
        if (this.activeKeys.length > 0 && time > this.lastMoveTime + MOVE_INTERVAL) {
            const currentDir = this.activeKeys[this.activeKeys.length - 1];
            this.executeMove(currentDir);
        }

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
            item.sprite.y = item.gridY * this.tileSize + this.tileSize / 2 + 50;
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
