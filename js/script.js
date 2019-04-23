/**
 * Author: Alexander Cai
 */
import BootScene from "./scenes/bootScene.js";
import LoadScene from "./scenes/loadScene.js";
import IntermissionScene from "./scenes/intermissionScene.js";
import MainScene from "./scenes/mainScene.js";
import InfoScene from "./scenes/infoScene.js";
import PauseScene from "./scenes/pauseScene.js";
import CreditsScene from "./scenes/creditsScene.js";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const config = {
  title: "A Midsummer Night's Game",
  type: Phaser.AUTO,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  backgroundColor: "#555555",
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [BootScene, LoadScene, IntermissionScene, MainScene, InfoScene, PauseScene, CreditsScene]
};

window.addEventListener("load", () => {
  window.game = new Phaser.Game(config);
});