import { NPC_DATA } from "../util/npcData.js";
import { TILE_MAPPING } from "../util/tileMapping.js";

export class Door extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, name) {
    super(scene, x, y, width, height);
    this.setOrigin(0, 0);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setName(name);
    this.lines = NPC_DATA[name].LINES;
  }

  collide(player) {}

  interact(player) {
    this.scene.registry.events.emit("talk", this.lines);
  }
}

export class Chest extends Phaser.GameObjects.TileSprite {
  constructor(scene, x, y) {
    super(scene, x, y, 0, 0, "dungeonTiles", TILE_MAPPING.CHEST);
    this.setOrigin(0, 0);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setImmovable(true);

    this.opened = false;
  }

  collide(player) {}

  interact(player) {
    if (this.opened) return;
    this.scene.registry.events.emit("talk", "You received $1000!");
    player.changeMoney(1000);
    this.opened = true;
  }
}