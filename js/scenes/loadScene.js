export default class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadScene" });
  }
  
  preload() {
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics()
      .fillStyle(0x222222, 0.8)
      .fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", {
      font: "20px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);
    
    const percentText = this.add.text(width / 2, height / 2 - 5, "0%", {
      font: "18px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);
    
    const assetText = this.add.text(width / 2, height / 2 + 50, "", {
      font: "18px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);
    
    this.load.on("progress", value => {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear()
        .fillStyle(0xffffff, 1)
        .fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on("fileprogress", file =>
      assetText.setText("Loading asset: " + file.key)
    );
    
    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.load.image("tiles", "assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/tuxemon-town.json");

    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    this.load.atlas("atlas", "assets/atlas/atlas.png", "assets/atlas/atlas.json");
    this.load.image("logo", "zenvalogo.png");
    for (var i = 0; i < 500; i++) {
      this.load.image("logo"+i, "zenvalogo.png");
    }
  }
  
  create() {
    const progressBox = this.add.graphics()
      .fillStyle(0x222222, 0.8)
      .fillRect(240, 270, 320, 50);

    const finished = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Finished. Press any key to begin", {
      font: "18px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);
    
    this.input.keyboard.once("keyup", () => this.scene.start("MainScene"));
  }
}