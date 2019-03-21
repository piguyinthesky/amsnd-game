export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: "PauseScene" });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.add.text(width / 2, height / 4, "Paused", {
      font: "24px monospace",
      fill: "#ffffff"
    });

    this.input.keyboard.once("keyup-ENTER");

    this.add
      .text(16, 16, "Arrow keys to move", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
  }
}