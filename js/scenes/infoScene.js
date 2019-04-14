const style = {
  font: "24px monospace",
  fill: "#00ff00",
  padding: { x: 20, y: 10 },
  backgroundColor: "#ffffff"
};

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
    this.registry.set({
      money: 0,
      lives: 3,
      inventory: [],

      mute: false,
      volume: 0.5
    });

    const { width, height } = this.cameras.main;

    this.scoreText = this.add.text(5, 5, "Money $: 0", style);
    let bl = this.scoreText.getBottomLeft();
    this.livesText = this.add.text(bl.x, bl.y, "Lives ❤️: 3", style);
    this.inventoryText = this.add.text(0, height, "Inventory: Nothing", {
      fixedWidth: width,
      font: "24px monospace",
      fill: "#000000",
      padding: {x: 20, y: 10},
      backgroundColor: "#ffffff"
    }).setOrigin(0, 1);

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

    this.audioImage = this.add.image(width - 5, 5, "musicOn")
      .setDisplaySize(width / 32, height / 32)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.registry.set("mute", !this.registry.get("mute")));

    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    this.registry.events
      .on("pause", prevScene => {
        this.scene.launch("PauseScene", { prevScene });
      })
      .on("changedata", (parent, key, data) => {
        if (key === "money")
          this.scoreText.setText("Money: " + data);
        else if (key === "lives")
          this.livesText.setText("Lives: " + data);
        else if (key === "inventory")
          this.inventoryText.setText("Inventory: " + data.join(", "));

        else if (key === "mute") {
          if (data) {
            this.music.pause();
            this.audioImage.setTexture("musicOff");
          } else {
            this.music.resume();
            this.audioImage.setTexture("musicOn");
          }
        } else if (key === "volume") 
          this.music.setVolume(data);
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
        this.finished = true;
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
