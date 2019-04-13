/**
 * A scene that handles a lot of the global objects, such as the registry and the music
 */
export default class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfoScene" });

    this.speed = 50;
    this.timer = 0;
    this.i = 0;
    this.finished = false;
    this.playing = false;
    this.text = "";
  }

  create() {
    this.registry
      .set("money", 0)
      .set("lives", 3)
      .set("volume", 0.5)
      .set("inventory", []);

    const { width, height } = this.cameras.main;
    this.scoreText = this.add.text(5, 5, "Money $: 0", {
      font: "24px monospace",
      fill: "#00ff00",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    });

    const bl = this.scoreText.getBottomLeft();
    this.livesText = this.add.text(bl.x, bl.y, "Lives ❤️: 3", {
      font: "24px monospace",
      fill: "#ffff00",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    });

    const margin = { x: width / 64, y: height / 32 };
    this.textImg = this.add.image(margin.x, height / 2 + margin.y, "textBox")
      .setDisplaySize(width - margin.x * 2, height / 2 - margin.y * 2)
      .setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false);

    const border = { x: this.textImg.displayWidth * 4 / 190, y: this.textImg.displayHeight * 6 / 49 }; // Based off textBox.png
    this.displayText = this.add.text(this.textImg.x + border.x, this.textImg.y + border.y, "", {
      font: "16px monospace",
      fill: "black",
      wordWrap: { width: this.textImg.displayWidth - border.x * 2 },
      padding: { x: 20, y: 10 }
    }).setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false);

    this.audioImage = this.add.image(width - 5, 5, "musicOn").setDisplaySize(width / 32, height / 32).setOrigin(1, 0);

    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    this.registry.events
      .on("changedata", (parent, key, data) => {
        if (key === "money")
          this.scoreText.setText("Money: " + data);
        if (key === "lives")
          this.livesText.setText("Lives: " + data);
        if (key === "mute")
          this.audioImage.setTexture(data ? "musicOff" : "musicOn");
        if (key === "volume")
          this.music.applyConfig({ volume: 0.5, loop: true });
      })
      .on("talk", lines => {
        if (this.playing) return;

        this.text = Array.isArray(lines) ? lines.join("\n") : lines;
        this.speed = 50;
        this.timer = 0;
        this.i = 0;

        this.finished = false;
        this.playing = true;

        this.displayText.setText("");
        this.textImg.setVisible(true);
        this.displayText.setVisible(true);
        this.registry.events.emit("freezeplayer", true);
      })
      .on("stoptalking", () => {
        this.playing = false;
        this.textImg.setVisible(false);
        this.displayText.setVisible(false);
        this.registry.events.emit("freezeplayer", false);
      });

    this.input.keyboard.on("keyup_ENTER", (event) => {
      if (this.finished) {
        event.stopPropagation();
        this.registry.events.emit("stoptalking");
      }
    });
  }

  update(time, delta) {
    if (!this.playing || this.finished) return;

    this.timer += delta;
    if (this.timer < this.speed) return;

    this.timer %= this.speed;

    const current = this.displayText.text.concat(this.text[this.i]);
    this.i++;
    
    if (this.i === this.text.length)
      this.finished = true;
    
    this.displayText.setText(current);
  }
}
