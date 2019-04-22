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

    this.actText = this.add.text(width / 2, height * 3 / 8, this.registry.get("actInfo").title, boxStyle(24, width)).setOrigin(0.5);
    this.sceneText = this.add.text(width / 2, height * 5 / 8, this.registry.get("sceneInfo").title, boxStyle(24, width)).setOrigin(0.5);

    this.titleBounce = this.add.tween({
      targets: this.actText,
      y: 10,
      ease: "Sine.easeInOut",
      duration: 1000,
      repeat: -1,
      yoyo: true
    });

    this.input.keyboard.on("keydown_ENTER", () => {
      event.stopPropagation();
      this.background.destroy();
      this.actText.destroy();
      this.sceneText.destroy();
      this.titleBounce.stop();
      this.scene.start("MainScene");
    });
  }

  update() {
    this.background.tilePositionX += 1;
  }

}