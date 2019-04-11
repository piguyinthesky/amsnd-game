export default class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfoScene" });
  }

  create() {
    this.scoreText = this.add.text(5, 5, "Money $: ", {
      font: "24px monospace",
      fill: "#00ff00",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    });

    const bl = this.scoreText.getBottomLeft();
    this.livesText = this.add.text(bl.x, bl.y, "Lives ❤️: ", {
      font: "24px monospace",
      fill: "#ffff00",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    });

    this.registry.events.on("changedata", (parent, key, data) => {
      if (key === "money")
        this.scoreText.setText("Money: " + data);
      if (key === "lives")
        this.livesText.setText("Lives: " + data);
    });
  }
}