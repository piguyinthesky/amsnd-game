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

const textBoxStyle = (width) => ({
  font: "16px monospace",
  fill: "#000000",
  wordWrap: { width },
  padding: { x: 20, y: 10 }
});

/**
* A scene that handles a lot of the global objects, such as the registry
*/
export default class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: "InfoScene" });
  }
  
  create() {
    const { width, height } = this.cameras.main;

    // ==================== TEXT BOX ====================
    const margin = { x: width / 64, y: height / 32 };
    this.textImg = this.add.image(margin.x, height / 2 + margin.y, "textBox")
      .setDisplaySize(width - margin.x * 2, height / 2 - margin.y * 2)
      .setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false)
      .setDepth(50);
    
    const border = { x: this.textImg.displayWidth * 4 / 190, y: this.textImg.displayHeight * 6 / 49 }; // Based off textBox.png
    this.displayText = this.add.text(this.textImg.x + border.x, this.textImg.y + border.y, "", textBoxStyle(this.textImg.displayWidth - border.x * 2)).setScrollFactor(0)
      .setOrigin(0, 0)
      .setVisible(false)
      .setLineSpacing(border.y / 4)
      .setDepth(51);

    // ==================== MENU ====================
    this.menu = false;
    this.options = [];
    this.selected = 0;
    this.response = "";
    this.texts = [];
    this.images = [];
    this.lines = [];

    this.input.off("keyup_UP").off("keyup_DOWN").off("keyup_ENTER");
    
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
              if (this.options.length > 0) {
                const next = this.cb(this, this.options[this.selected].text);
                if (next) this.lines.unshift(next);
              }
              this.menuoptions = [];
              this.cb = null;
              this.destroyMenu();
            }
            this.showText(false);
            if (this.texts.length === 0) this.nextLine();
          } else if (this.timer.getOverallProgress() > 0) // Player presses enter while text is scrolling
            this.timer.remove(true); // Jump to end of timer
        } else if (this.texts.length > 0) {
          const result = this.texts.slice().sort((a, b) => a.y - b.y).map(obj => obj.text).join();
          
          if (result === this.speakerInfo.lines.join()) {
            this.speechBubble("Well done!");
            this.texts.forEach(obj => obj.destroy());
            this.images.forEach(img => img.destroy());
            this.texts = [];
            this.images = [];
          } else {
            this.speechBubble("Hmm, something doesn't look quite right...");
          }
        }
      });
    
    this.initRegistry();
  }

  nextLine() {
    if (this.lines.length > 0)
      this.startText(this.lines.shift());
    else {
      console.log(this.registry.values.speakerIndex);
      console.log(this.registry.values.sceneInfo.speakers.length);
      if (this.registry.values.speakerIndex === this.registry.values.sceneInfo.speakers.length - 1) {
        this.scene.get("MainScene").scene.start("IntermissionScene");
      } else {
        this.registry.values.speakerIndex++;
        this.startText(this.speakerInfo);
      }
    }
  }

  startText(data) {
    this.currentLine = data;
    if (data.speaker) this.registry.events.emit("zoomto", data.speaker);
    console.log("data");
    console.log(data);

    if (data.lines && 4 <= data.lines.length && data.lines.length <= 8 && Math.random() < 0.5) {
      this.sortInOrder(data.lines);
    } else if (Math.random() < 0.5 && data.speaker && data.lines.length > 1) {
      this.speechBubble(this.parseLine([
        data,
        {
          text: "Who said this?",
          cb: (infoScene, response) => {
            console.log("callback");
            if (response.toLowerCase() === data.speaker.toLowerCase()) return "Well done!";
            else return "Actually, it was " + capitalize(data.speaker);
          },
          options: Phaser.Utils.Array.Shuffle(this.registry.values.sceneInfo.characters.slice())
        }
      ], { hidden: true }));
    } else {
      this.speechBubble(this.parseLine(data));
    }
  }

  sortInOrder() {
    const { width, height } = this.cameras.main;

    const currLines = Phaser.Utils.Array.Shuffle(this.speakerInfo.lines.slice());

    this.speechBubble(`Put ${this.speakerInfo.speaker}'s lines into order! Press enter when you're finished.`);

    for (let i in currLines) {
      const text = this.add.text(width / 2, height * (parseInt(i) + 0.5) / currLines.length, currLines[i], textBoxStyle(width / 2)).setOrigin(0.5).setName(i).setDepth(21);
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
    }
  }

  speechBubble(text) {
    this.showText(true);

    this.timer = this.time.addEvent({
      delay: this.registry.get("talkSpeed"),
      callback: () => {
        this.displayText.setText(text.slice(0, text.length - this.timer.getRepeatCount()));
        if (this.timer.getOverallProgress() === 1 && this.menuoptions) {
          const { x, y } = this.displayText.getBottomLeft();
          this.menu = this.add.container(x, y).setDepth(52);
          for (let option of this.menuoptions) {
            const temp = new Phaser.GameObjects.Text(this, 0, this.options.length * 20, option, deselected);
            this.options.push(temp);
            this.menu.add(temp);
            if (temp.getBottomLeft().y + this.menu.y > this.textImg.getBottomLeft().y) {
              temp.x += (this.textImg.displayWidth / 2);
              temp.y -= 160
            }
          }
          this.moveSelection(0);
        }
      },
      repeat: text.length
    });
  }
  
  showText(val, lines) {
    this.textImg.setVisible(val);
    this.displayText.setText(lines || "");
    this.displayText.setVisible(val);
    if (val) this.registry.set("paused", true);
    else this.registry.set("paused", false);
  }

  destroyMenu() {
    for (let i = 0; i < this.options.length; i++)
      this.options[i].destroy();

    this.menu.destroy();
    this.options.length = 0;
    this.selected = 0;
    this.menu = false;
  }
  
  parseLine(obj, flags = {}) {
    if (typeof obj === "string") return obj;
    else if (typeof obj === "function") return this.parseLine(obj(this, this.response));
    else if (Array.isArray(obj)) {
      this.lines = obj.concat(this.lines); // add to the start of the line
      return this.parseLine(this.lines.shift(), flags);
    } else if (typeof obj === "object") {
      console.log("parsing obj");
      console.log(obj);
      if (obj.speaker) {
        const lines = obj.lines.slice();
        let temp = lines.splice(0, 5);
        let result = [];
        while (temp.length > 0) {
          result.push((flags.hidden ? "?????" : obj.speaker) + "\n\n" + temp.join("\n"));
          temp = lines.splice(0, 5);
        }
        return this.parseLine(result, flags);
      } else if (obj.options) {
        this.menuoptions = obj.options;
        this.cb = obj.cb;
        return obj.text;
      }
    } else return null;
  }

  moveSelection(dir) {
    if (this.options.length === 0) return;
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
      .on("talk", () => {
        if (!this.displayText.visible) this.startText(this.parseLine(this.speakerInfo));
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
        });
      });

    this.registry.set({
      infoInitialized: true,
      talkSpeed: 50,
    });
    this.registry.set("actIndex", 0);
  }

  handleData(parent, key, data) {
    switch (key) {
    case "actIndex":
      this.registry.values.actInfo = this.cache.json.get("fullPlay").acts[data];
      this.registry.set("sceneIndex", 0);
      break;

    case "sceneIndex":
      this.registry.values.sceneInfo = this.registry.values.actInfo.scenes[data];
      this.registry.set("speakerIndex", 0);
      break;

    case "speakerIndex":
      this.registry.values.speakerInfo = this.registry.values.sceneInfo.speakers[data];
      break;
            
    default:
      break;
    }
  }

  get speakerInfo() { return this.registry.values.speakerInfo; }
  // get currentLine() { return this.lines.length > 0 ? this.lines[0] : this.speakerInfo; }
  
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
