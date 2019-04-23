const boxStyle = (size, width) => ({
  fontFamily: "gothic",
  fontSize: `${size}px`,
  fill: "#ffff00",
  padding: { x: 20, y: 10 },
  wordWrap: {width, useAdvancedWrap: true},
  align: "center"
});

export default class IntermissionScene extends Phaser.Scene {
  constructor() {
    super("IntermissionScene");
  }

  create() {
    const { width, height } = this.cameras.main;

    this.background = this.add.tileSprite(0, 0, width, height, "background").setDisplaySize(width, height).setOrigin(0);

    this.actText = this.add.text(width / 2, height * 3 / 8, this.registry.values.actInfo.title, boxStyle(24, width)).setOrigin(0.5);
    this.sceneText = this.add.text(width / 2, height * 5 / 8, this.registry.values.sceneInfo.title, boxStyle(24, width)).setOrigin(0.5);

    this.input.keyboard
      .on("keyup_LEFT", () => this.currScene -= 1)
      .on("keyup_RIGHT", () => this.currScene += 1)
      .on("keyup_ENTER", () => {
        event.stopPropagation();
        this.background.destroy();
        this.actText.destroy();
        this.sceneText.destroy();
        this.scene.start("MainScene");
      });
  }

  update() {
    this.background.tilePositionX += 1;
  }

  get currAct() { return this.registry.values.actIndex; }
  get currActInfo() { return this.registry.values.actInfo; }

  set currScene(val) {
    if (val >= this.currActInfo.scenes.length) {
      this.registry.set("actIndex", (this.currAct + val + 5) % 5);
      this.actText.setText(this.currActInfo.title);
    } else if (val < 0) {
      this.registry.set("actIndex", (this.currAct + val + 5) % 5);
      this.actText.setText(this.currActInfo.title);
      this.currScene = this.currActInfo.scenes.length - 1;
    } else {
      this.registry.set("sceneIndex", val);
    }

    this.sceneText.setText(this.currSceneInfo.title);
  }
  get currScene() { return this.registry.values.sceneIndex; }
  get currSceneInfo() { return this.registry.values.sceneInfo; }

}