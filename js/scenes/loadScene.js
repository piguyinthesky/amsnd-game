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
        .spritesheet("character", "atlas/character.png", {
          frameWidth: 16,
          frameHeight: 16,
          spacing: 1
        })

        .image("roguelikeCity", "tilesets/roguelike-city.png")
        .image("roguelikeRPG", "tilesets/roguelike-rpg.png")
        .image("dungeonTiles", "tilesets/dungeon.png")
        .image("pond", "tilesets/pond.png")
        .image("moneySign", "tilesets/money-sign.png")
        .image("roguelikeCharacters", "tilesets/roguelike-characters.png")

        .image("bill", "sprites/bill.png")
        .image("rightArrow", "sprites/rightArrow.png")
        .image("textBox", "sprites/textBox.png")
        
        .tilemapTiledJSON("map", "tilemaps/tuxemon-town.json")
        .tilemapTiledJSON("outsideMap", "tilemaps/outside-bank.json")
    } catch (error) {
      assetText.setText("Error: " + error);
    }
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    this.add.text(width / 2, height / 4, "Rob the Bank!", {
      font: "20px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffff00"
    }).setOrigin(0.5, 0.5);
    
    this.add.text(width / 2, height * 3 / 8, "How to Play", {
      font: "18px monospace"
    }).setOrigin(0.5, 0.5);
    
    this.add.text(width / 2, height / 2, "Press enter to start", {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    }).setOrigin(0.5, 0.5);
    
    this.input.keyboard.once("keyup", () => {
      this.scene.start("MainScene")
    });
  }
}