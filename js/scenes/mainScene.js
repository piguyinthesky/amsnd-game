import { Policeman, Entity } from "../objects/entity.js";
import Player from "../objects/player.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    
    this.initialized = false;
    this.lastEntityTouched = null;
  }
  
  create() {    
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
          this.npcs.add(new Entity(this, obj.x, obj.y, obj.name), true);
      } else if (obj.type === "spawn" && obj.name === "player") {
        this.player = new Player(this, obj.x, obj.y);
      } else if (obj.type === "door") {
        const door = new Entity(this, obj.x, obj.y, obj.name).setOrigin(0, 0).setSize(obj.width, obj.height).setDisplaySize(obj.width, obj.height);
        this.layers.forEach(layer => {
          layer.getTilesWithinWorldXY(obj.x, obj.y, obj.width, obj.height).forEach(tile => tile.setCollision(false));
        });
        this.npcs.add(door);
      }
    });
    
    this.physics.add.collider([this.player.sprite, this.npcs], this.layers);
    this.physics.add.collider(this.npcs); // They collide with each other
    this.physics.add.collider(this.player.sprite, this.npcs, (player, npc) => npc.collide(this.player));
    
    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pausegame", "MainScene"))
      .on("keyup_ENTER", () => {
        if (this.lastEntityTouched) this.lastEntityTouched.interact(this.player);
      });
    
    if (!this.initialized) {
      this.scene.launch("InfoScene"); // This will only run the first time
      this.initialized = true;
    }
  }
  
  update() {
    if (!this.registry.get("paused")) this.player.update();
  }
}
