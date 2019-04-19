/**
 * Author: Alexander Cai
 * Asset Credits go to Alvin Wong
 * global Phaser, Dungeon
 */
import LoadScene from "./scenes/loadScene.js";
import MainScene from "./scenes/mainScene.js";
import BankScene from "./scenes/bankScene.js";
import PauseScene from "./scenes/pauseScene.js";
import InfoScene from "./scenes/infoScene.js";
import EndScene from "./scenes/endScene.js";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const config = {
  title: "Rob the Bank!",
  type: Phaser.AUTO,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  backgroundColor: "#555555",
  parent: "game-container",
  pixelArt: true,
  scene: [LoadScene, MainScene, BankScene, InfoScene, PauseScene, EndScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scale: {
    parent: "game-container",
    mode: Phaser.Scale.FIT,
    width: 800,
    height: 600
  }
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});