import { NPC, Policeman } from "../objects/npc.js";
import Player from "../objects/player.js";
import { Door } from "../objects/items.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    
    this.initialized = false;
  }
  
  create() {
    this.playerTouchingNPC = false;
    
    // ========== LOADING TILEMAP AND LAYERS ==========
    if (!this.map) {
      this.map = this.make.tilemap({ key: "outsideMap" });
      
      // (Tiled tileset name, Phaser tileset image name)
      this.tilesets = [
        this.map.addTilesetImage("RoguelikeCity", "roguelikeCity"),
        this.map.addTilesetImage("Rogue Like Rpg", "roguelikeRPG"),
        this.map.addTilesetImage("Pond", "pond", 16, 16, 0, 1),
        this.map.addTilesetImage("Money Sign", "moneySign")
      ];
    }

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.layers = [
      this.map.createStaticLayer("Below World", this.tilesets, 0, 0),
      this.map.createStaticLayer("World", this.tilesets, 0, 0)
        .setCollisionByProperty({ collides: true }),
      this.map.createStaticLayer("Above World", this.tilesets, 0, 0)
        .setCollisionByProperty({ collides: true }),
      this.map.createStaticLayer("Above Player", this.tilesets, 0, 0)
        .setCollisionByProperty({ collides: true })
        .setDepth(10)
    ];
    this.objectLayer = this.map.getObjectLayer("Objects");
    
    this.npcs = this.physics.add.group({
      collideWorldBounds: true,
      immovable: true
    });

    this.objectLayer.objects.forEach(obj => {
      if (obj.type === "npc") {
        if (obj.name === "policeman")
          this.npcs.add(new Policeman(this, obj.x, obj.y, obj.name));
        else
          this.npcs.add(new NPC(this, obj.x, obj.y, obj.name));
      } else if (obj.type === "spawn" && obj.name === "player") {
        this.player = new Player(this, obj.x, obj.y);
      } else if (obj.type === "door") {
        const door = new Door(this, obj.x, obj.y, obj.width, obj.height, obj.name);
        this.layers.forEach(layer => {
          layer.getTilesWithinWorldXY(obj.x, obj.y, obj.width, obj.height).forEach(tile => tile.setCollision(false));
        });
        this.npcs.add(door);
      }
    });
    
    this.physics.add.collider([this.player.sprite, this.npcs], this.layers);
    this.physics.add.collider(this.npcs); // They collide with each other
    this.physics.add.collider(this.player.sprite, this.npcs, (player, npc) => {
      npc.collide(this.player);
      this.playerTouchingNPC = npc;
      this.time.delayedCall(1500, () => this.playerTouchingNPC = false); // Since I couldn't figure out how to check when they stop colliding, we just assume the user will interact with the npc within 1.5 seconds; if they press enter later it'll still work
    });
    
    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pausegame", "MainScene"))
      .on("keyup_ENTER", () => {
        if (this.playerTouchingNPC) this.playerTouchingNPC.interact(this.player);
      });
    
    this.registry.events.on("freeze", freeze => {
      this.player.sprite.body.moves = !freeze;
      this.npcs.children.iterate(child => child.body.moves = !freeze);
    })
    
    if (!this.initialized) {
      this.scene.launch("InfoScene"); // This will only run the first time
      this.registry.events.emit("freeze", true);
      this.cameras.main
        .setZoom(4).zoomTo(2, 1000, "Linear", false, (cam, progress) => {
          if (progress === 1) this.registry.events.emit("freeze", false);
        });
      this.initialized = true;
    }
  }
  
  update() {
    if (!this.registry.get("paused")) this.player.update();
  }
}
