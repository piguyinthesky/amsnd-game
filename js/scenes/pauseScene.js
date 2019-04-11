export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: "PauseScene" });
  }

  init(data) {
    this.prevScene = data.prevScene;
    this.scene.sleep(this.prevScene);
    this.scene.bringToTop();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.add.text(width / 2, height / 4, "Paused", {
      font: "24px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, height / 3, "Music Volume", {
      font: "18px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);

    const musicVolumeBar = this.add.rectangle(width / 2, height / 2, width * 0.9, height / 64, "red").setOrigin(0.5, 0.5);
    const volumeDragger = this.add.circle(width / 2, height / 2, 10, "blue").setInteractive({ useHandCursor: true });
    this.input.setDraggable(volumeDragger)
      .on("dragstart", (pointer, obj) => {
        obj.setFillStyle(0x00ff00);
      })
      .on("drag", (pointer, obj, dx, dy) => {
        obj.x = dx;
      })
      .on("dragend", (pointer, obj) => {
        obj.setFillStyle(0xff00ff);
      });

    this.input.keyboard.on("keyup_ENTER", event => {
      this.scene.wake(this.prevScene);
      this.scene.stop();
    });
  }
}