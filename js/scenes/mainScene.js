import NPC from "../objects/npc.js";
import Player from "../objects/player.js"

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }
  
  create() {
    this.hasPlayerReachedBank = false;
    const map = this.make.tilemap({ key: "outsideMap" });
    
    // (Tiled tileset name, Phaser tileset image name)
    const tilesets = [
      map.addTilesetImage("RoguelikeCity", "roguelikeCity"),
      map.addTilesetImage("Rogue Like Rpg", "roguelikeRPG"),
      map.addTilesetImage("Pond", "pond"),
      map.addTilesetImage("People", "roguelikeCharacters"),
      map.addTilesetImage("Money Sign", "moneySign")
    ];
    
    const groundLayer = map.createStaticLayer("The Ground", tilesets, 0, 0)
    .setCollisionByProperty({ collides: true });
    const aboveGround = map.createStaticLayer("Buildings/Above Ground", tilesets, 0, 0)
    .setCollisionByProperty({ collides: true })
    const aboveBuildings = map.createStaticLayer("Above Buildings", tilesets, 0, 0)
    .setCollisionByProperty({ collides: true })
    const abovePlayer = map.createStaticLayer("Above Player", tilesets, 0, 0)
    .setCollisionByProperty({ collides: true })
    .setDepth(10);

    aboveBuildings.setTileIndexCallback(838, () => {
      this.hasPlayerReachedBank = true;
      this.player.freeze();
      this.cameras.main
      .fade(250, 0, 0, 0)
      .on("camerafadeoutcomplete", () => {
        this.scene.start("BankScene");
      });
    }, null, this);

    const spawnPoint = map.findObject("Object Layer 1", obj => obj.name === "Spawn Point");
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);
    this.physics.add.collider(this.player.sprite, [groundLayer, aboveGround, aboveBuildings, abovePlayer]);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main
    .startFollow(this.player.sprite)
    .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    console.log(aboveBuildings.getTileAtWorldXY(832.5, 285))

    // Debug graphics
    this.input.keyboard.once("keydown_D", () => {
      this.physics.world.createDebugGraphic(); 
      
      const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
      
      aboveGround.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      });
    });

    this.add
    .text(16, 16, "Arrow keys to move\nPress \"D\" to show hitboxes", {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);
  }
  
  update() {
    if (!this.hasPlayerReachedBank) this.player.update();
    
    if (this.cursors.space.isDown)
      console.log(      this.input.x, this.input.y        );
    
  }
}
