const style = {
  font: "18px monospace",
  fill: "#00ff00",
  padding: { x: 20, y: 10 },
  backgroundColor: "#ffffff"
};

const deselected = {
  font: "16px monospace",
  fill: "#000000",
  padding: { x: 20, y: 10 },
  backgroundColor: "#00000000"
};

const selected = {
  font: "16px monospace",
  fill: "#ffffff",
  padding: { x: 20, y: 10 },
  backgroundColor: "#ffff00"
};

const option = {
  fontFamily: "gothic",
  fill: "#000000"
};

const textBoxStyle = (width) => ({
  font: "16px monospace",
  fill: "#000000",
  wordWrap: { width },
  padding: { x: 20, y: 10 }
});

/**
* A scene that handles a lot of the global objects, such as the registry and the music
*/
export default class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfoScene" });
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // ==================== MONEY AND LIVES ====================
    this.livesText = this.add.text(5, 5, "Lives ❤: 3", style);
    this.hpBar = this.add.rectangle(width - 5, 5, width / 4, 24, 0xff0000).setOrigin(1, 0);
    this.baseWidth = width / 4 - 10;
    this.currentHpBar = this.add.rectangle(width - 10, 10, this.baseWidth, 14, 0x00ff00).setOrigin(1, 0);
    this.inventoryText = this.add.text(5, height - 5, "Inventory: Nothing", style).setOrigin(0, 1);

    // ==================== TEXT BOX ====================
    const margin = { x: width / 64, y: height / 32 };
    this.textImg = this.add.image(margin.x, height / 2 + margin.y, "textBox")
      .setDisplaySize(width - margin.x * 2, height / 2 - margin.y * 2)
      .setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false);
    
    const border = { x: this.textImg.displayWidth * 4 / 190, y: this.textImg.displayHeight * 6 / 49 }; // Based off textBox.png
    this.displayText = this.add.text(this.textImg.x + border.x, this.textImg.y + border.y, "", textBoxStyle(this.textImg.displayWidth - border.x * 2)).setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false)
      .setLineSpacing(border.y / 4);

    // ==================== MENU ====================
    this.menu = false;
    this.options = [];
    this.selected = 0;
    this.response = "";
    this.currLines = [];

    // ==================== MUSIC ====================
    this.audioImage = this.add.image(width - 5, 5, "musicOn")
      .setDisplaySize(width / 32, height / 32)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.registry.set("mute", !this.registry.get("mute")));
    
    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    this.texts = [];
    
    this.input.keyboard
      .on("keyup_UP", () => {
        if (this.menu) this.moveSelection(-1);
      })
      .on("keyup_DOWN", () => {
        if (this.menu) this.moveSelection(1);
      })
      .on("keyup_ENTER", event => { // This is the only place where the timer will end
        if (this.displayText.visible) {
          event.stopPropagation(); // Prevents the event from reaching other scenes
          if (this.timer.getOverallProgress() === 1) { // Current text is finished
            if (this.menu) {
              this.response = this.options[this.selected].text;
              this.destroyMenu();
            }
            this.startText();
          } else if (this.timer.getOverallProgress() > 0) // Player presses enter while text is scrolling
            this.timer.remove(true); // Jump to end of timer
        } else if (this.texts.length > 0) {
          console.log(this.texts);
          const result = this.texts.sort((a, b) => a.y - b.y).map(obj => obj.text);
          this.texts.forEach(obj => obj.destroy());
          this.images.forEach(img => img.destroy());
          this.registry.events.emit("talk", (result === this.currLines.lines) ? result : "Hmm, something doesn't look quite right...");
        }
      });
    
    this.initRegistry();
  }

  startText() {
    this.textData = this.lines.shift();
    this.text = this.parseLine(this.textData);

    console.log("Text: " + this.text);
    if (!this.text) return this.showText(false);

    if (this.currLines.length > 0) {
      if (this.texts) this.texts.forEach(text => text.destroy());
      if (this.images) this.images.forEach(img => img.destroy());

      this.showText(false);

      const { width, height } = this.cameras.main;

      this.texts = [];
      this.images = [];

      Phaser.Utils.Array.Shuffle(this.currLines);

      this.add.text(width / 2, height * 0.5 / this.currLines.length, `Put ${this.textData.speaker}'s lines into order! Press enter when you're finished.`, {
        font: "16px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        wordWrap: {width, useAdvancedWrap: true},
        backgroundColor: "#ffffff",
        align: "center"
      });

      for (let i in this.currLines) {
        const text = this.add.text(width / 2, height * (parseInt(i) + 1.5) / (this.currLines.length + 1), this.currLines[i], textBoxStyle(width / 2)).setOrigin(0.5).setName(i).setDepth(21);
        const {x, y} = text.getTopLeft();
        text.setPosition(x, y).setOrigin(0);
        const image = this.add.image(x - 5, y - 5, "textBox").setDisplaySize(text.displayWidth + 10, text.displayHeight + 10).setOrigin(0).setName(i).setDepth(20).setInteractive({ useHandCursor: true });

        this.input.setDraggable(image)
          .on("dragstart", (pointer, obj) => {
            obj.setTexture("textBoxPressed").setDisplaySize(obj.displayWidth, obj.displayHeight);
          })
          .on("drag", (pointer, obj, dx, dragY) => {
            obj.setY(dragY);
            this.texts[obj.name].setY(dragY);
          }).on("dragend", (pointer, obj) => {
            obj.setTexture("textBox").setDisplaySize(obj.displayWidth, obj.displayHeight);
          });

        this.texts.push(text);
        this.images.push(image);
        console.log("created")
      }
    } else {
      this.timer = this.time.addEvent({
        delay: this.registry.get("talkSpeed"),
        callback: () => {
          this.displayText.setText(this.text.slice(0, this.text.length - this.timer.getRepeatCount()));
          if (this.timer.getOverallProgress() === 1 && this.textData.options) {
            const { x, y } = this.displayText.getBottomLeft();
            this.menu = this.add.container(x, y);
            for (let option of this.textData.options) {
              const text = new Phaser.GameObjects.Text(this, 0, this.options.length * 20, option, deselected);
              this.options.push(text);
              this.menu.add(text);
            }
            this.moveSelection(0);
          }
        },
        repeat: this.text.length
      });
    
      this.showText(true);
    }
  }
  
  showText(val) {
    this.textImg.setVisible(val);
    this.displayText.setText("");
    this.displayText.setVisible(val);
    if (val) this.scene.pause("MainScene");
    else this.scene.resume("MainScene");
  }

  destroyMenu() {
    for (let i = 0; i < this.options.length; i++)
      this.options[i].destroy();

    this.menu.destroy();
    this.options.length = 0;
    this.selected = 0;
    this.menu = false;
  }
  
  parseLine(obj) {
    if (typeof obj === "string") return obj;
    else if (typeof obj === "function") return this.parseLine(obj(this, this.response));
    else if (Array.isArray(obj)) {
      this.lines = obj.concat(this.lines); // add to the start of the line
      this.textData = this.lines.shift();
      return this.parseLine(this.textData);
    } else if (typeof obj === "object") {
      if (obj.speaker) {
        this.currLines = obj;
        let result = [];
        console.log("Currlines: " + this.currLines)
        while (true) {
          let temp = obj.lines.splice(0, 5);
          if (temp.length !== 0) result.push(obj.speaker + "\n\n" + temp.join("\n"));
          if (temp.length < 5) break;
        }
        this.registry.events.emit("zoomto", obj.speaker);
        return this.parseLine(result);
      }
      return obj.text;
    } else
      return null;
  }

  moveSelection(dir) {
    this.options[this.selected].setStyle(deselected);
    this.selected = Math.min(Math.max(this.selected + dir, 0), this.options.length - 1);
    this.options[this.selected].setStyle(selected);
  }

  initRegistry() {
    this.registry.events
      .on("pausegame", prevScene => {
        this.scene.launch("PauseScene", { prevScene });
      })
      .on("changedata", this.handleData.bind(this))
      .on("setdata", this.handleData.bind(this))
      .on("talk", lines => {
        console.log("Lines: " + lines);
        // If the current text has not yet finished, we ignore other talk events
        if (this.displayText.visible) return;
        this.lines = Array.isArray(lines) ? lines.slice() : [lines];
        this.startText();
      })
      .on("switchscene", (scene1, scene2, data) => {
        if (this.timer) this.timer.remove(true);
        if (this.menu) this.destroyMenu();
        this.showText(false);
        this.scene.pause(scene1);
        const scene = this.scene.get(scene1);
        this.cameras.main.fade(500).once("camerafadeoutcomplete", () => {
          scene.scene.start(scene2, data);
          this.cameras.main.resetFX();
          this.registry.set("level", scene2);
          this.music.play();
        });
      });

    this.registry.set({
      infoInitialized: true,
      
      money: 0,
      lives: 3,
      hp: 1000,
      inventory: [],
      
      mute: false,
      volume: 0.5,

      actData: 0,
      sceneData: 0,
      speakerData: 0,
      
      talkSpeed: 50,
    });
    this.registry.set("actIndex", 0);
    this.registry.set("sceneIndex", 0);
    this.registry.set("speakerIndex", 0);
  }

  handleData(parent, key, data) {
    switch (key) {
    case "mute":
      if (data) {
        this.music.pause();
        this.audioImage.setTexture("musicOff");
      } else {
        this.music.resume();
        this.audioImage.setTexture("musicOn");
      }
      break;

    case "volume":
      this.music.setVolume(data);
      break;

    case "actIndex":
      this.registry.set("actInfo", this.cache.json.get("fullPlay").acts[this.registry.values.actIndex]);
      break;

    case "sceneIndex":
      this.registry.set("sceneInfo", this.registry.get("actInfo").scenes[this.registry.values.sceneIndex]);
      break;

    case "speakerIndex":
      this.registry.set("speakerInfo", this.registry.get("sceneInfo").speakers[this.registry.values.speakerIndex]);
      break;
            
    default:
      break;
    }
  }

}
