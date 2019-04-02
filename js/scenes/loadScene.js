import SpeechBubble from "../objects/speechBubble.js";

const fontConfig = {
  image: "retroFont",
  width: 46,
  height: 48,
  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!().,' ",
  charsPerRow: 6,
  spacing: { x: 2, y: 2 }
};

const h1style = {
  font: "20px monospace",
  fill: "#ffffff"
};

const h2style = {
  font: "18px monospace",
  fill: "#ffffff"
};

export default class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadScene" });
  }
  
  /**
   * We draw a loading bar as the assets are being loaded, which shouldn't take long
   */
  preload() {
    const { width, height } = this.cameras.main;
    
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
      this.load
        .setBaseURL("assets/")
        .spritesheet("characters", "atlas/buch-characters-64px-extruded.png", {
          frameWidth: 64,
          frameHeight: 64,
          margin: 1,
          spacing: 2
        })
        .image("tiles", "tilesets/tuxmon-sample-32px-extruded.png")
        .image("dungeonTiles", "tilesets/buch-tileset-48px-extruded.png")
        .image("bill", "sprites/bill.png")
        .image("rightArrow", "sprites/rightArrow.png")
        .image("textBox", "sprites/textBox.png")
        .image("retroFont", "fonts/retro-metal-font.png")
        .tilemapTiledJSON("map", "tilemaps/tuxemon-town.json")
        .atlas("atlas", "atlas/atlas.png", "atlas/atlas.json");
    } catch (error) {
      assetText.setText("Error: " + error);
    }
  }
  
  create() {
    this.cache.bitmapFont.add("retrometal", Phaser.GameObjects.RetroFont.Parse(this, fontConfig));

    const { width, height } = this.cameras.main;
    
    this.add.text(width / 2, height / 4, "Rob the Bank!", {
      font: "20px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffff00"
    }).setOrigin(0.5, 0.5);
    
    this.add.text(width / 2, height * 3 / 8, "How to Play", {
    }).setOrigin(0.5, 0.5);
    
    this.add.text(width / 2, height / 2, "Press enter to start", {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    }).setOrigin(0.5, 0.5);

    this.welcome = new SpeechBubble(this, "Hello World")
    
    // Load the main scene underneath for a background, and switch over to it when the user presses any key
    this.scene.launch("MainScene");
    this.scene.bringToTop(this);
    
    this.input.keyboard.once("keyup", () => {
      this.scene.setActive(false);
      this.scene.setVisible(false);
    });
  }

  update(time, delta) {
    this.welcome.update(time, delta);
  }
}