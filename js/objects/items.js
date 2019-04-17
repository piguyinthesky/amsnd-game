import { ROGUELIKE_CHARACTERS } from "../util/tileMapping.js";
import { NPC_DATA } from "../util/npcData.js";
import { TILE_MAPPING } from "../util/tileMapping.js";

export class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  onPickup(player) {
    this.scene.registry.values.inventory.push(this.texture.key);
    this.destroy();
  }
}

export class Bill extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, "bill");

    this.setSize(32, 32).setDisplaySize(32, 32);
    this.setOrigin(0.5, 0.5);
  }

  onPickup(player) {
    this.scene.registry.values.money += 10;
    this.scene.sound.play(Phaser.Utils.Array.GetRandom(["coin1", "coin2", "coin3", "coin4"]));
    this.destroy();
  }
}

export class DiamondSword extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, "rpgChars", ROGUELIKE_CHARACTERS.SWORD.DIAMOND);
  }

  onPickup(player) {
    this.scene.registry.events.emit("addtoinventory", "diamondSword");
    this.scene.registry.events.emit("talk", ["You have obtained the legendary diamond sword!"]);
    this.destroy();
  }
}

export class RunningShoes extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, "rpgChars", ROGUELIKE_CHARACTERS.BOOTS.BLUE);
  }

  onPickup(player) {
    this.scene.registry.events.emit("addtoinventory", "runningShoes");
    this.scene.registry.events.emit("talk", "You have obtained the mythical running shoes! Hold Z to go faster.");
    this.destroy();
  }
}

export class Door extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, name) {
    super(scene, x, y, width, height);
    this.setOrigin(0, 0);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setName(name);
    this.lines = NPC_DATA[name].lines;
  }

  collide(player) {}

  interact(player) {
    this.scene.registry.events.emit("talk", this.lines);
  }
}

export class Chest extends Phaser.GameObjects.TileSprite {
  constructor(scene, x, y) {
    super(scene, x, y, 0, 0, "dungeonTileset", TILE_MAPPING.CHEST[0].index);
    this.setOrigin(0, 0);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  collide(player) {}

  interact(player) {
    if (this.opened) return;
    this.scene.registry.events.emit("talk", "You received $1000!");
    this.scene.registry.values.money += 1000;
    this.opened = true;
  }
}
