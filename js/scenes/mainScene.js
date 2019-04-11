import NPC from "../objects/npc.js";
import Player from "../objects/player.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });

    this.money = 0;
    this.lives = 3;
  }
  
  create() {
    this.registry.set("money", this.money);
    this.registry.set("lives", this.lives);

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
      .setCollisionByProperty({ collides: true });
    const aboveBuildings = map.createStaticLayer("Above Buildings", tilesets, 0, 0)
      .setCollisionByProperty({ collides: true });
    const abovePlayer = map.createStaticLayer("Above Player", tilesets, 0, 0)
      .setCollisionByProperty({ collides: true })
      .setDepth(10);

    aboveGround.getTileAt(49, 47).setCollision(false);
    aboveGround.getTileAt(51, 47).setCollision(false);

    groundLayer.setTileLocationCallback(47, 26, 16, 16, () => {
      groundLayer.setTileLocationCallback(47, 26, 16, 16, null, this);
      this.hasPlayerReachedBank = true;
      this.player.freeze();
      this.cameras.main
        .fade(250, 0, 0, 0)
        .on("camerafadeoutcomplete", () => this.scene.start("BankScene"));
    });
    aboveBuildings.setTileLocationCallback(49, 46, 1, 2, () => {
      aboveBuildings.setTileLocationCallback(49, 46, 1, 2, null, this);
      this.fadeToScene("BankScene")
    });
    aboveBuildings.setTileLocationCallback(51, 46, 1, 2, () => {
      aboveBuildings.setTileLocationCallback(51, 46, 1, 2, null, this);
      this.fadeToScene("BankScene");
    });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const spawnPoint = map.findObject("Object Layer 1", obj => obj.name === "Spawn Point");

    this.player = new Player(this, spawnPoint.x, spawnPoint.y);
    this.policemen = this.physics.add.group();
    
    for (let i = 0; i < 10; i++) {
      const npc = new NPC(this, spawnPoint.x - 64 + i * 16, spawnPoint.y + 64, "Police");
      this.policemen.push(npc);
    }

    this.physics.add.collider(this.player.sprite, [groundLayer, aboveGround, aboveBuildings, abovePlayer]);
    this.physics.add.collider(this.policemen, [groundLayer, aboveGround, aboveBuildings, abovePlayer]);
    this.physics.add.collider(this.policemen);
    this.physics.add.collider(this.player.sprite, this.policemen, () => this.player.changeLives(-1));

    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    this.input.keyboard.on("keyup_ESC", event => {
      this.scene.launch("PauseScene", { prevScene: "MainScene" });
      this.scene.sleep();
    });

    this.scene.launch("InfoScene");
  }
  
  update() {
    if (!this.hasPlayerReachedBank) {
      this.player.update();
      this.policemen.forEach(child => child.update());
    }
  }

  fadeToScene(scene) {
    this.hasPlayerReachedBank = true;
    this.player.freeze();
    this.cameras.main
      .fade(250, 0, 0, 0)
      .on("camerafadeoutcomplete", () => this.scene.start(scene));
  }
}
