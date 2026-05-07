import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import RunnerScene from './scenes/RunnerScene.js';
import CleanerScene from './scenes/CleanerScene.js';
import ResultScene from './scenes/ResultScene.js';

const config = {
    type: Phaser.AUTO,
    width: 880,
    height: 930,
    parent: document.body,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, RunnerScene, CleanerScene, ResultScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
