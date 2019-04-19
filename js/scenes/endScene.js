const boxStyle = {
  font: "18px monospace",
  fill: "#000000",
  padding: { x: 20, y: 10 },
  backgroundColor: "#ffffff"
};

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
  }

  init(data) {
    if (data.text) this.text = data.text;
  }

  create () {
    const { width, height } = this.cameras.main;

    this.add.image(0, 0, "title").setDisplaySize(width, height).setOrigin(0);

    this.creditsText = this.add.text(0, 0, "Credits", { fontSize: "32px", fill: "#000000", padding: {x:20, y:10}, backgroundColor: "#ffffff" });
    this.madeByText = this.add.text(0, 0, "Created By: Alexander Cai", boxStyle);
    this.assetsByText = this.add.text(0, 0, "Assets and Maps: Alvin Wong, from kenney.nl", boxStyle);
    this.textText = this.add.text(0, 0, this.text || "Congratulations on beating the game somehow!\nSorry it wasn't fully finished.", boxStyle);
    this.finalCredits = this.add.text(0, 0, "Thank you so much for playing!", boxStyle);
    this.zone = this.add.zone(width / 2, height / 2, width, height);

    const texts = [this.creditsText, this.madeByText, this.assetsByText, this.textText, this.finalCredits];
    for (let i in texts) {
      Phaser.Display.Align.In.Center(texts[i], this.zone);
      texts[i].setY(height + 100);
    }

    this.tweens.add({
      targets: this.creditsText,
      y: -100,
      ease: "Power1",
      duration: 3000,
      delay: 1000
    });
    this.tweens.add({
      targets: this.madeByText,
      y: -100,
      ease: "Power1",
      duration: 3000,
      delay: 2000
    });
    this.tweens.add({
      targets: this.assetsByText,
      y: -100,
      ease: "Power1",
      duration: 3000,
      delay: 3000
    });
    this.tweens.add({
      targets: this.textText,
      y: -100,
      ease: "Power1",
      duration: 3000,
      delay: 4000
    })

    this.madeByTween = this.tweens.add({
      targets: this.finalCredits,
      y: -100,
      ease: "Power1",
      duration: 6000,
      delay: 5000,
      onComplete: () => {
        this.madeByTween.destroy();
        this.scene.start("LoadScene");
      }
    });
  }
}
