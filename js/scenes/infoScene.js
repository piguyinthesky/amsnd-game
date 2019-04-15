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
  }

  create() {
    this.registry.set({
      infoInitialized: true,

      money: 0,
      lives: 3,
      inventory: [],

      mute: false,
      volume: 0.5,

      talkSpeed: 50
    });

    const { width, height } = this.cameras.main;

    this.scoreText = this.add.text(5, 5, "Money $: 0", style);
    let bl = this.scoreText.getBottomLeft();
    this.livesText = this.add.text(bl.x, bl.y, "Lives ❤: 3", style);
    this.inventoryText = this.add.text(0, height, "Inventory: Nothing", {
      font: "24px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
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
      fill: "#000000",
      wordWrap: { width: this.textImg.displayWidth - border.x * 2 },
      padding: { x: 20, y: 10 }
    }).setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false)
      .setLineSpacing(border.y);

    this.audioImage = this.add.image(width - 5, 5, "musicOn")
      .setDisplaySize(width / 32, height / 32)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.registry.set("mute", !this.registry.get("mute")));

    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    this.registry.events
      .on("pausegame", prevScene => {
        this.scene.launch("PauseScene", { prevScene });
      })
      .on("changedata", (parent, key, data) => {
        if (key === "money")
          this.scoreText.setText("Money $: " + data);
        else if (key === "lives")
          this.livesText.setText("Lives ❤: " + data);
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
        // If the current text has not yet finished, we ignore other talk events
        if (this.displayText.visible) return;

        this.lines = lines.slice();
        this.text = Array.isArray(lines) ? this.parseLine(this.lines.shift()) : lines;

        this.timer = this.time.addEvent({
          delay: this.registry.get("talkSpeed"),
          callback: () => {
            this.displayText.setText(this.text.slice(0, this.text.length - this.timer.getRepeatCount()));
          },
          repeat: this.text.length
        });

        this.showText(true);
      })
      .on("switchscene", (scene1, scene2) => {
        const scene = this.scene.get(scene1);
        scene.scene.pause();
        this.cameras.main.fade(500).once("camerafadeoutcomplete", () => {
          scene.scene.start(scene2);
          this.cameras.main.resetFX();
        });
      });

    this.input.keyboard.on("keyup_ENTER", event => {
      if (!this.timer || !this.displayText.visible) return; // We only worry about enter presses when the text is showing
  
      event.stopPropagation(); // Prevents the event from reaching other scenes

      if (this.timer.getOverallProgress() === 1) { // Current text is finished
        if (Array.isArray(this.lines) && this.lines.length > 0) {
          this.text = this.parseLine(this.lines.shift());
          this.timer.destroy();

          if (this.text) {
            this.timer = this.time.addEvent({
              delay: this.registry.get("talkSpeed"),
              callback: () => {
                this.displayText.setText(this.text.slice(0, this.text.length - this.timer.getRepeatCount()));
              },
              repeat: this.text.length
            });
          } else this.showText(false);
        } else this.showText(false);
      }
    });
  }

  showText(val) {
    this.textImg.setVisible(val);
    this.displayText.setText("");
    this.displayText.setVisible(val);
    this.registry.events.emit("freezeplayer", val);
  }

  parseLine(obj) {
    if (typeof obj === "string") return obj;
    if (typeof obj === "function") return this.parseLine(obj(this));
    if (Array.isArray(obj)) {
      this.lines = obj.concat(this.lines);
      return this.parseLine(this.lines.shift());
    }
  }
}
