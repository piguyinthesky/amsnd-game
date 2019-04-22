import { Entity } from "../objects/entity.js";
import Player from "../objects/player.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    
    this.initialized = false;
    this.lastEntityTouched = null;
    this.timesRun = 0;
  }

  init(data) {
    this.fromSewer = data.fromSewer;
    if (data.died) this.registry.set("hp", 1000);
  }
  
  create() {    
    this.timesRun++;
    
    // ========== LOADING TILEMAP AND LAYERS ==========
    if (!this.map) {
      this.map = this.make.tilemap({ key: "outsideMap" });
      
      // (Tiled tileset name, Phaser tileset image name)
      this.tilesets = [
        this.map.addTilesetImage("RoguelikeCity", "roguelikeCity"),
        this.map.addTilesetImage("Rogue Like Rpg", "roguelikeRPG"),
        this.map.addTilesetImage("Pond", "pond", 16, 16, 0, 1),
      ];
    }

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

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    this.entities = this.physics.add.group({
      collideWorldBounds: true,
      immovable: true
    });
    this.bullets = this.physics.add.group();

    this.map.getObjectLayer("Objects").objects.forEach(obj => {
      if (obj.type === "npc")
        this.entities.add(new Entity(this, obj.x, obj.y, obj.name));
      else if (obj.type === "spawn" && obj.name === "player" && !this.fromSewer)
        this.player = new Player(this, obj.x, obj.y); 
      else if (obj.type === "spawn" && obj.name === "sewer" && this.fromSewer)
        this.player = new Player(this, obj.x, obj.y);
      else if (obj.type === "door") {
        this.layers.forEach(layer => {
          layer.getTilesWithinWorldXY(obj.x, obj.y, obj.width, obj.height).forEach(tile => tile.setCollision(false));
        });
        this.entities.add(new Entity(this, obj.x, obj.y, obj.name).setOrigin(0, 0).setSize(obj.width, obj.height).setDisplaySize(obj.width, obj.height));
      }
    });

    this.hitboxes = this.physics.add.staticGroup();
    this.map.getObjectLayer("Hitboxes").objects.forEach(o => {
      this.hitboxes.create(o.x, o.y).setOrigin(0).setSize(o.width, o.height).setVisible(false);
    });
    this.hitboxes.refresh();
    
    this.physics.add.collider([this.player.sprite, this.entities], this.layers.concat(this.hitboxes));
    this.physics.add.collider(this.entities); // They collide with each other
    this.physics.add.collider(this.player.sprite, this.entities, (player, npc) => npc.collide(this.player));
    this.physics.add.collider(this.bullets, [this.entities, this.layers.concat(this.hitboxes)], (bullet, entity) => {
      if (entity.hp) entity.hp -= bullet.damage;
      if (entity.hp <= 0) entity.destroy();
      bullet.destroy();
    });
    
    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pausegame", "MainScene"))
      .on("keyup_ENTER", () => {
        if (this.lastEntityTouched) this.lastEntityTouched.interact(this.player);
      });

    this.registry.events.on("zoomto", speaker => {
      const speakerObj = this.entities.getChildren().filter(child => child.name.toLowerCase() === speaker.toLowerCase())[0];
      this.cameras.main.startFollow(speakerObj, false, 0.5, 0.5).zoomTo(4, 1000, "Linear");
    });
    
    if (!this.initialized) {
      this.scene.launch("InfoScene"); // This will only run the first time

      this.cameras.main.setZoom(4).zoomTo(2, 1000, "Linear");
      this.time.delayedCall(1005, () => this.registry.events.emit("talk", this.registry.values.sceneInfo.speakers))
      this.initialized = true;
    }
  }
  
  update() {
    if (!this.registry.get("paused")) this.player.update();
  }
}
