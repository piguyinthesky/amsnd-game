import { NPC_DATA } from "../util/npcData.js";
import { TILE_MAPPING, ROGUELIKE_CHARACTERS } from "../util/tileMapping.js";
import { Entity, InteractiveObject } from "./entity.js";

export class Bill extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "bill");

    this
      .setSize(16, 16)
      .setDisplaySize(16, 16)
      .setOrigin(0.5, 0.5);
  }

  collide(player) {
    this.scene.registry.values.money += 10;
    this.scene.sound.play(Phaser.Utils.Array.GetRandom(["coin1", "coin2", "coin3", "coin4"]));
    this.destroy();
  }
}

export class DiamondSword extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "rpgChars", ROGUELIKE_CHARACTERS.SWORD.DIAMOND);
  }

  collide(player) {
    this.scene.registry.events.emit("addtoinventory", "diamondSword");
    this.scene.registry.events.emit("talk", "You have obtained the legendary diamond sword!");
    this.destroy();
  }
}

export class RunningShoes extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "rpgChars", ROGUELIKE_CHARACTERS.BOOTS.BLUE);
  }

  collide(player) {
    this.scene.registry.events.emit("addtoinventory", "runningShoes");
    this.scene.registry.events.emit("talk", "You have obtained the mythical running shoes! Hold Z to go faster.");
    this.destroy();
  }
}

export class Stairs extends InteractiveObject {
  constructor(scene, x, y) {
    super(scene, x, y, "dungeonTileset", TILE_MAPPING.STAIRS);
  }
}

export class Chest extends InteractiveObject {
  constructor(scene, x, y) {
    super(scene, x, y, "dungeonTileset", TILE_MAPPING.CHEST[0].index, "chest");
    this.setOrigin(0, 0);
  }

  interact(player) {
    if (this.opened) return;
    this.scene.registry.events.emit("talk", "You received $1000!");
    this.scene.registry.values.money += 1000;
    this.opened = true;
  }
}
