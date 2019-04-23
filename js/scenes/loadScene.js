import { Entity } from "../objects/entity.js";

const h1style = {
  font: "20px monospace",
  fill: "#ffffff"
};

const h2style = {
  font: "18px monospace",
  fill: "#ffffff"
};

const boxStyle = (size, width) => ({
  fontFamily: "gothic",
  fontSize: `${size}px`,
  fill: "#ffff00",
  padding: { x: 20, y: 10 },
  wordWrap: {width, useAdvancedWrap: true},
  align: "center"
});

export default class LoadScene extends Phaser.Scene {
  constructor() {
    super("LoadScene");
  }
  
  /**
   * We draw a loading bar as the assets are being loaded, which shouldn't take long
   */
  preload() {
    const { width, height } = this.cameras.main;

    this.background = this.add.tileSprite(0, 0, width, height, "background").setOrigin(0).setScrollFactor(0);
    
    const boxW = width / 2.5;
    const boxH = height / 12;
    
    const progressBar = this.add.graphics(); // Progress bar goes under
    const progressBox = this.add.graphics()
      .fillStyle("#222222", 0.8)
      .fillRect((width - boxW) / 2, (height - boxH) / 2, boxW, boxH);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", h1style).setOrigin(0.5, 0.5);
    const percentText = this.add.text(width / 2, height / 2 - 5, "0%", h2style).setOrigin(0.5, 0.5);
    const assetText = this.add.text(width / 2, height / 2 + 50, "", h2style).setOrigin(0.5, 0.5);
    
    this.load.on("progress", value => {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear()
        .fillStyle("#ffffff", 1)
        .fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on("fileprogress", file => assetText.setText("Loading asset: " + file.key));
    
    this.load.on("complete", () => {
      [progressBar, progressBox, loadingText, percentText, assetText].forEach(obj => obj.destroy());
    });
    
    try {
      this.load.setBaseURL("assets/")
        .json("fullPlay", "../js/util/amsnd.json")

        .setPath("sprites/")
        .image("bill", "bill.png")
        .image("camera", "camera1.png")
        .image("rightArrow", "rightArrow.png")
        .image("textBox", "textBox.png")
        .image("textBoxPressed", "textBox_pressed.png")

        .setPath("spritesheets/")
        .spritesheet("police", "police.png", {
          frameWidth: 16,
          frameHeight: 32,
          spacing: 1
        })
        .spritesheet("rpgChars", "roguelike-chars.png", {
          frameWidth: 16,
          frameHeight: 16,
          spacing: 1
        })
        .spritesheet("customChars", "characters.png", {
          frameWidth: 16,
          frameHeight: 16,
          spacing: 0
        })

        .setPath("tilemaps/")
        .tilemapTiledJSON("outsideMap", "outside-bank.json")

        .setPath("tilesets/")
        .image("roguelikeCity", "roguelike-city.png")
        .image("roguelikeRPG", "roguelike-rpg.png")
        .image("dungeonTiles", "custom-dungeon.png")
        .image("pond", "pond.png")
        .image("moneySign", "money-sign.png");
    } catch (error) {
      assetText.setText("Error: " + error);
    }
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    this.anims.create({
      key: "police-moving",
      frames: this.anims.generateFrameNumbers("police", { frames: [0, 1, 0, 2] }),
      frameRate: 10,
      repeat: -1
    });

    let i = 0;
    ["front", "back", "left", "right"].forEach(dir => {
      this.anims.create({
        key: `character-${dir}`,
        frames: this.anims.generateFrameNumbers("character", { frames: [i, i + 1, i, i + 2] }),
        frameRate: 10,
        repeat: -1
      });
      i += 3;
    });

    this.add.text(width / 2, height / 4, "A Midsummer Night's Dream", boxStyle(36, width)).setOrigin(0.5);
    this.add.text(width / 2, height * 3 / 8, "Use the arrow keys or WASD to move and press enter to interact with people", boxStyle(24, width)).setOrigin(0.5);
    this.add.text(width / 2, height / 2, "By Alexander Cai", boxStyle(24, width)).setOrigin(0.5);
    this.add.text(width / 2, height * 5 / 8, "Choose one of the following to start!", boxStyle(24, width)).setOrigin(0.5);

    this.scene.launch("InfoScene");

    const characters = ["Helena", "Hermia", "Lysander", "Demetrius"];
    const y = height * 7 / 8;
    for (let i in characters) {
      const x = width * (parseInt(i) + 0.5) / 4;
      this.add.text(x, y - width / 8, characters[i], boxStyle(18, width)).setOrigin(0.5);
      const player = this.add.existing(new Entity(this, x, y, characters[i].toLowerCase()).setDisplaySize(width / 8, width / 8));
      player.setInteractive()
      .on("pointerup", () => {
        this.registry.set("name", characters[i]);
        this.scene.start("IntermissionScene");
      });
    }
  }

  update() {
    this.background.tilePositionX += 1;
  }
}