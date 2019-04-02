import SpeechBubble from "../objects/speechBubble.js";
import NPC from "../objects/npc.js";
import Player from "../objects/player.js"

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    this.hasPlayerReachedBank = false;
    const map = this.make.tilemap({ key: "map" });

    // (Tiled tileset name, Phaser tileset image name)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0)
      .setCollisionByProperty({ collides: true });
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0)
      .setDepth(10);

    const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    const bankDoor = map.findObject("Objects", obj => obj.name === "Bank Door");
    const enterBank = this.physics.add.image(bankDoor.x, bankDoor.y);

    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    this.npcs = this.physics.add.group();
    this.npcs.addMultiple(map.filterObjects("Objects", obj => obj.name.match(/^NPC/)).map(sp => new NPC(this, sp.x, sp.y, sp.name.substring(3))));

    this.physics.add.collider(this.player.sprite, worldLayer);
    this.physics.add.collider(this.player.sprite, enterBank, () => {
      this.hasPlayerReachedBank = true;
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.on("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.start("BankScene");
      });
    }, null, this);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    ["left", "right", "front", "back"].forEach(dir => {
      this.anims.create({
        key: `misa-${dir}-walk`,
        frames: this.anims.generateFrameNames("atlas", {
          prefix: `misa-${dir}-walk.`,
          start: 0,
          end: 3,
          zeroPad: 3
        }),
        frameRate: 10,
        repeat: -1
      });
    });

    this.cameras.main
      .startFollow(this.player.sprite)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.add
      .text(16, 16, "Arrow keys to move\nPress \"D\" to show hitboxes", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);
      
    // const bubble = new SpeechBubble(this, spawnPoint.x, spawnPoint.y, 50, 10, "blehblehblehbleh blehblehblehblehblehbleh");

    // Debug graphics
    this.input.keyboard.once("keydown_D", () => {
      this.physics.world.createDebugGraphic(); // Turn on physics debugging to show player's hitbox

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      });
    });
  }

  update() {
    if (!this.hasPlayerReachedBank)
      this.player.update();
  }
}
