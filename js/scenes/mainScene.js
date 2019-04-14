import { NPC, Policeman } from "../objects/npc.js";
import Player from "../objects/player.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }
  
  create() {
    this.hasPlayerReachedBank = false;
    this.playerTouchingNPC = false;
    const map = this.make.tilemap({ key: "outsideMap" });
    
    // (Tiled tileset name, Phaser tileset image name)
    const tilesets = [
      map.addTilesetImage("RoguelikeCity", "roguelikeCity"),
      map.addTilesetImage("Rogue Like Rpg", "roguelikeRPG"),
      map.addTilesetImage("Pond", "pond"),
      map.addTilesetImage("Money Sign", "moneySign")
    ];
    
    const groundLayer = map.createStaticLayer("Below Player", tilesets, 0, 0)
      .setCollisionByProperty({ collides: true });
    const stuffLayer = map.createStaticLayer("World", tilesets, 0, 0)
      .setCollisionByProperty({ collides: true });
    const abovePlayer = map.createStaticLayer("Above Player", tilesets, 0, 0)
      .setCollisionByProperty({ collides: true })
      .setDepth(10);

    stuffLayer.getTileAt(49, 47).setCollision(false);
    stuffLayer.getTileAt(51, 47).setCollision(false);

    groundLayer.setTileLocationCallback(47, 26, 16, 16, () => {
      groundLayer.setTileLocationCallback(47, 26, 16, 16, null, this);
      this.hasPlayerReachedBank = true;
      this.registry.events.emit("freezeplayer", true);
      this.cameras.main
        .fade(250, 0, 0, 0)
        .on("camerafadeoutcomplete", () => this.scene.start("BankScene"));
    });
    abovePlayer.setTileLocationCallback(49, 46, 1, 2, () => {
      abovePlayer.setTileLocationCallback(49, 46, 1, 2, null, this);
      this.fadeToScene("BankScene");
    });
    abovePlayer.setTileLocationCallback(51, 46, 1, 2, () => {
      abovePlayer.setTileLocationCallback(51, 46, 1, 2, null, this);
      this.fadeToScene("BankScene");
    });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const spawnPoint = map.findObject("Object Layer 1", obj => obj.name === "Spawn Point");

    this.player = new Player(this, spawnPoint.x, spawnPoint.y);
    this.npcs = this.physics.add.group({
      collideWorldBounds: true,
      immovable: true
    });

    this.physics.add.collider(this.player.sprite, [groundLayer, stuffLayer, abovePlayer, abovePlayer]);
    this.physics.add.collider(this.npcs, [groundLayer, stuffLayer, abovePlayer, abovePlayer]);
    this.physics.add.collider(this.npcs); // They collide with each other
    this.physics.add.collider(this.player.sprite, this.npcs, (player, npc) => {
      npc.collide(player);
      this.playerTouchingNPC = npc;
      this.time.delayedCall(1500, () => this.playerTouchingNPC = false); // Since I couldn't figure out how to check when they stop colliding, we just assume the user will interact with the npc within 2 seconds; if they press enter later it'll still work
    }, null, this);

    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pause", "MainScene"))
      .on("keyup_ENTER", () => {
        if (this.playerTouchingNPC)
          this.playerTouchingNPC.interact(this.player);
      });

    this.scene.launch("InfoScene");

    this.npcs.add(new NPC(this, this.player.sprite.x + 64, this.player.sprite.y + 64, "rpgChars", 324, "My name's jeff"));
    this.npcs.add(new NPC(this, this.player.sprite.x - 64, this.player.sprite.y + 64, "rpgChars", 270, "Bob the Builder"));
  }
  
  update() {
    if (this.hasPlayerReachedBank || this.registry.get("paused")) return;
    this.player.update();
  }

  fadeToScene(scene) {
    this.hasPlayerReachedBank = true;
    this.registry.events.emit("freezeplayer", true);
    this.cameras.main
      .fade(250, 0, 0, 0)
      .on("camerafadeoutcomplete", () => this.scene.start(scene));
  }
}
