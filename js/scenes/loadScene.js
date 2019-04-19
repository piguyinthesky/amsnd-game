const h1style = {
  font: "20px monospace",
  fill: "#ffffff"
};

const h2style = {
  font: "18px monospace",
  fill: "#ffffff"
};

const boxStyle = {
  font: "18px monospace",
  fill: "#000000",
  padding: { x: 20, y: 10 },
  backgroundColor: "#ffffff"
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
      this.load.setBaseURL("assets/")
        .setPath("audio/") // Generated using bfxr
        .audio("coin1", "Pickup_Coin.wav")
        .audio("coin2", "Pickup_Coin2.wav")
        .audio("coin3", "Pickup_Coin3.wav")
        .audio("coin4", "Pickup_Coin4.wav")
        .audio("powerup", "Powerup.wav")
        .audio("shoot", "Laser_Shoot.wav")
        .audio("music", "jlbrock44_-_Staying_Positive.mp3")
        .audio("dungeonMusic", "8bit-dungeon-level.mp3")

        .setPath("sprites/")
        .image("bill", "bill.png")
        .image("camera", "camera1.png")
        .image("rightArrow", "rightArrow.png")
        .image("textBox", "textBox.png")
        .image("musicOn", "musicOn.png")
        .image("musicOff", "musicOff.png")
        .image("title", "title-page.png")

        .setPath("spritesheets/")
        .spritesheet("character", "character.png", {
          frameWidth: 16,
          frameHeight: 16,
          spacing: 1
        })
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
        .spritesheet("dungeonTileset", "../tilesets/custom-dungeon.png", {
          frameWidth: 16,
          frameHeight: 16,
          spacing: 1
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

    this.add.image(0, 0, "title").setDisplaySize(width, height).setOrigin(0);

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
    
    this.add.text(width / 2, height / 4, "Rob the Bank!", boxStyle).setOrigin(0.5, 0.5);
    this.add.text(width / 2, height * 3 / 8, "Use the arrow keys or WASD to move", boxStyle).setOrigin(0.5, 0.5);
    this.add.text(width / 2, height / 2, "By Alexander Cai and Alvin Wong", boxStyle).setOrigin(0.5, 0.5);
    this.add.text(width / 2, height * 5 / 8, "Press enter to start", boxStyle).setOrigin(0.5, 0.5);
    
    this.input.keyboard.once("keyup_ENTER", () => this.scene.start("MainScene"));
  }
}