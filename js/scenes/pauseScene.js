const boxStyle = size => ({
  font: `${size}px monospace`,
  fill: "#000000",
  padding: { x: 20, y: 10 },
  backgroundColor: "#ffffff"
});
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
    
    this.add.text(width / 2, height / 4, "Paused", boxStyle(24)).setOrigin(0.5, 0.5);

    this.restartText = this.add.text(width / 2, height / 2, "Choose scene", boxStyle(18))
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerup", () => {
        this.scene.get("MainScene").scene.start("IntermissionScene");
        this.scene.get("InfoScene").scene.restart();
        this.scene.stop();
      })

    this.talkSpeedText = this.add.text(width / 2, height * 3 / 4, "Text speed: medium", boxStyle(18))
      .setOrigin(0.5)
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