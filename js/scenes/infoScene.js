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

      currentAct: null,
      currentScene: null,
      
      money: 0,
      lives: 3,
      hp: 1000,
      inventory: [],
      
      mute: false,
      volume: 0.5,
      
      talkSpeed: 50,
      level: "MainScene"
    });
    
    const { width, height } = this.cameras.main;
    
    // ==================== MONEY AND LIVES ====================
    this.moneyText = this.add.text(5, 5, "Money $: 0", style);
    let bl = this.moneyText.getBottomLeft();
    this.livesText = this.add.text(bl.x, bl.y + 3, "Lives ❤: 3", style);
    this.hpBar = this.add.rectangle(width - 5, 5, width / 4, this.moneyText.height, 0xff0000).setOrigin(1, 0);
    this.baseWidth = width / 4 - 10;
    this.currentHpBar = this.add.rectangle(width - 10, 10, this.baseWidth, this.moneyText.height - 10, 0x00ff00).setOrigin(1, 0);

    this.inventoryText = this.add.text(5, height - 5, "Inventory: Nothing", style).setOrigin(0, 1);

    // ==================== TEXT BOX ====================
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
      .setLineSpacing(border.y / 4);

    // ==================== MENU ====================
    this.menu = false;
    this.options = [];
    this.selected = 0;
    this.response = "";

    this.actText = this.add.text().setVisible(false);
    this.sceneText = this.add.text().setVisible(false);

    // ==================== MUSIC ====================
    this.audioImage = this.add.image(width - 5, 5, "musicOn")
      .setDisplaySize(width / 32, height / 32)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.registry.set("mute", !this.registry.get("mute")));
    
    this.music = this.sound.add("music", { loop: true });
    this.dungeonMusic = this.sound.add("dungeonMusic", { loop: true });
    this.music.play();
    
    // ==================== EVENTS ====================
    this.registry.events
      .on("pausegame", prevScene => {
        this.scene.launch("PauseScene", { prevScene });
      })
      .on("changedata", (parent, key, data) => {
        if (key === "money") {
          if (data >= 1000000) this.registry.events.emit("switchscene", this.registry.get("level"), "EndScene", { text: "Wow. I can't believe you actually did it. How long did you grind for? xD" });
          else this.moneyText.setText("Money $: " + data);
        } else if (key === "lives") {
          if (data <= 0 ) return this.scene.get(this.registry.get("level")).scene.start("EndScene", { ending: "died" });
          this.livesText.setText("Lives ❤: " + data);
        } else if (key === "hp") {
          if (data <= 0) {
            this.registry.values.lives -= 1;
            this.registry.events.emit("switchscene", this.registry.get("level"), "MainScene", { died: true });
          } else this.currentHpBar.displayWidth = this.baseWidth * (data / 1000);
        } else if (key === "inventory")
          this.inventoryText.setText("Inventory: " + data.join(", "));
      
        else if (key === "mute") {
          if (this.registry.get("level") === "MainScene") {
            if (data) {
              this.music.pause();
              this.audioImage.setTexture("musicOff");
            } else {
              this.music.resume();
              this.audioImage.setTexture("musicOn");
            }
          } else if (this.registry.get("level") === "BankScene") {
            if (data) {
              this.dungeonMusic.pause();
              this.audioImage.setTexture("musicOff");
            } else {
              this.dungeonMusic.resume();
              this.audioImage.setTexture("musicOn");
            }
          }
        } else if (key === "volume") {
          this.music.setVolume(data);
          this.dungeonMusic.setVolume(data);
        }
      })
      .on("addtoinventory", item => {
        this.registry.set("inventory", this.registry.get("inventory").concat(item));
      })
      .on("talk", lines => {
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
          this.playMusic();
        });
      })
      .on("beginscene", () => {
        this.scene.pause(this.registry.get("level"));
        this.currAct = this.cache.json.get("fullPlay").acts[this.registry.get("currentAct")];
        this.currScene = this.currAct.scenes[this.registry.get("currentScene")];

        this.actText = this.add.text(width / 2, height * 3 / 8, this.currAct.title, {
          fontFamily: "gothic",
          fontSize: 18,
          backgroundColor: "#000000"
        }).setOrigin(0.5);
        this.sceneText = this.add.text(width / 2, height * 5 / 8, this.currScene.title, {
          fontFamily: "gothic",
          fontSize: 18,
          backgroundColor: "#000000"
        }).setOrigin(0.5);

        this.titleBounce = this.add.tween({
          targets: this.actText,
          y: 100,
          ease: "Linear",
          duration: 1000,
          repeat: -1,
          yoyo: true
        });
        
        this.currSpeaker = 0;
      });
    
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
        } else if (this.actText.visible) {
          event.stopPropagation();
          this.actText.destroy();
          this.sceneText.destroy();
          this.titleBounce.stop();
          this.scene.resume(this.registry.get("level"));
          this.registry.events.emit("talk", this.currScene.speakers)
        }
      });
      
  }

  playMusic() {
    if (this.registry.get("level") === "MainScene") {
      this.dungeonMusic.pause();
      this.music.play();
    } else if (this.registry.get("level") === "BankScene") {
      this.music.pause();
      this.dungeonMusic.play();
    }
  }

  startText() {
    this.textData = this.lines.shift();
    this.text = this.parseLine(this.textData);

    if (!this.text) return this.showText(false);

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
  
  showText(val) {
    this.textImg.setVisible(val);
    this.displayText.setText("");
    this.displayText.setVisible(val);
    if (val) this.scene.pause(this.registry.get("level"));
    else this.scene.resume(this.registry.get("level"));
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
        let result = [];
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

}
