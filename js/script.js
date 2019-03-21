/**
 * Author: Alexander Cai
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 * global Phaser
 */
import LoadScene from "./scenes/loadScene.js";
import MainScene from "./scenes/mainScene.js";
import PauseScene from "./scenes/pauseScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [LoadScene, MainScene],
  title: "Rob the Bank!"
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