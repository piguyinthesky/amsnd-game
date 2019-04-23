import { Entity } from "../objects/entity.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    
    this.initialized = false;
    this.lastEntityTouched = null;
    this.timesRun = 0;
  }
  
  create() {    
    this.timesRun++;

    console.log(this.registry.values.sceneInfo.setting);
    
    // ========== LOADING TILEMAP AND LAYERS ==========
    this.map = this.add.tilemap(this.registry.values.sceneInfo.setting);
    this.map.addTilesetImage("roguelike-rpg", "roguelikeRPG"); // (Tiled tileset name, Phaser tileset image name)

    this.map.createStaticLayer("Below World", "roguelike-rpg", 0, 0);
    this.map.createStaticLayer("World", "roguelike-rpg", 0, 0);
    this.map.createStaticLayer("Above World", "roguelike-rpg", 0, 0);
    this.map.createStaticLayer("Above Player", "roguelike-rpg", 0, 0).setDepth(10);

    // this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    this.entities = this.physics.add.group({
      collideWorldBounds: true,
      immovable: true
    });

    const layer = this.registry.values.sceneInfo.objectLayer || "Objects";
    console.log(layer);
    this.map.getObjectLayer(layer).objects.forEach(obj => {
      if (obj.type === "npc")
        this.entities.add(new Entity(this, obj.x, obj.y, obj.name));
      else if (obj.type === "door") {
        this.map.layers.forEach(layer => {
          layer.getTilesWithinWorldXY(obj.x, obj.y, obj.width, obj.height).forEach(tile => tile.setCollision(false));
        });
        this.entities.add(new Entity(this, obj.x, obj.y, obj.name).setOrigin(0, 0).setSize(obj.width, obj.height).setDisplaySize(obj.width, obj.height));
      }
    });
    
    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pausegame", "MainScene"));

    this.registry.events.on("zoomto", speaker => {
      console.log(speaker);
      if (speaker === "ALL") this.cameras.main.zoomTo(2, 100);
      else {
        const speakerObj = this.entities.getChildren().filter(child => {
          console.log(child.name);
          return child.name === speaker.toLowerCase()
        })[0];
        
        this.cameras.main.startFollow(speakerObj, false, 0.5, 0.5).zoomTo(4, 1000, "Linear");
      }
    });
    
    this.cameras.main.setZoom(4).zoomTo(2, 1000, "Linear");
    this.time.delayedCall(1005, () => {
      this.registry.events.emit("talk");
    });    
  }
}
