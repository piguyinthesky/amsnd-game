export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: "PauseScene" });

    this.talkSpeeds = {
      "slow": 100, 
      "medium": 50,
      "fast": 10
    };
    this.talkSpeed = 1;
  }

  init(data) {
    this.registry.set("paused", true);
    this.prevScene = data.prevScene;
    this.scene.pause(this.prevScene);
    this.scene.sleep("InfoScene");
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.add.text(width / 2, height / 4, "Paused", {
      font: "24px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, height / 3, "Music Volume", {
      font: "18px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);

    const musicVolumeBar = this.add.rectangle(width / 2, height / 2, width * 3 / 4, height / 64, 0xff0000)
      .setOrigin(0.5, 0.5);
    const tl = musicVolumeBar.getTopLeft();
    const tr = musicVolumeBar.getTopRight();
    const volButtonX = (width / 2) * this.registry.get("volume");
    const volumeDragger = this.add.circle(tl.x + volButtonX, height / 2, 10, 0x0000ff)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5);
    
    this.input.setDraggable(volumeDragger)
      .on("dragstart", (pointer, obj) => {
        obj.setFillStyle(0x00ff00);
      })
      .on("drag", (pointer, obj, dx) => {
        if (tl.x < dx && dx < tr.x) obj.x = dx;
      })
      .on("dragend", (pointer, obj) => {
        obj.setFillStyle(0x0000ff);
        this.registry.set("volume", (obj.x - musicVolumeBar.getTopLeft().x) / musicVolumeBar.width);
      });

    this.talkSpeedText = this.add.text(width / 2, height * 3 / 4, "Text speed: medium", {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on("pointerup", () => {
        this.talkSpeed = (this.talkSpeed + 1) % 3;
        this.registry.set("talkSpeed", Object.values(this.talkSpeeds)[this.talkSpeed]);
        this.talkSpeedText.setText("Text speed: " + Object.keys(this.talkSpeeds)[this.talkSpeed]);
      });

    const { ESC, ENTER } = Phaser.Input.Keyboard.KeyCodes;
    this.input.keyboard.on("keyup", event => {
      event.stopPropagation();
      if (event.keyCode === ESC || event.keyCode === ENTER) {
        this.registry.set("paused", false);
        this.scene.resume(this.prevScene);
        this.scene.wake("InfoScene");
        this.scene.stop();
      }
    });
  }
}