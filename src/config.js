import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import RunnerScene from './scenes/RunnerScene.js';
import ResultScene from './scenes/ResultScene.js';

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 800,
    parent: document.body,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, RunnerScene, ResultScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
