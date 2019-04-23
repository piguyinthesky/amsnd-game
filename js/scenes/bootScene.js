export default class BootScene extends Phaser.Scene {
  constructor () {
    super("Boot");
  }

  preload () {
    this.load.image("background", "assets/sprites/Background.png");
  }

  create () {
    this.scene.start("LoadScene");
  }
}