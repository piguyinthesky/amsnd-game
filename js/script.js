/**
 * Author: Alexander Cai
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 * global Phaser
 */
import LoadScene from "./scenes/loadScene.js";
import MainScene from "./scenes/mainScene.js";
import BankScene from "./scenes/bankScene.js";
import PauseScene from "./scenes/pauseScene.js";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const config = {
  title: "Rob the Bank!",
  type: Phaser.AUTO,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  backgroundColor: 0x555555,
  parent: "game-container",
  pixelArt: true,
  scene: [LoadScene, MainScene, BankScene, PauseScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  const resize = () => {
    const scale = Math.min(window.innerWidth / DEFAULT_WIDTH, window.innerHeight / DEFAULT_HEIGHT);
    game.canvas.style.width = DEFAULT_WIDTH * scale + 'px';
    game.canvas.style.height = DEFAULT_HEIGHT * scale + 'px';
  }

  resize();
  window.addEventListener('resize', resize);
})