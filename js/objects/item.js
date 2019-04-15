import { ROGUELIKE_CHARACTERS } from "../util/tileMapping.js";

export class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  onPickup(player) {
    player.addToInventory(this.texture.key);
    this.destroy();
  }
}

export class Bill extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, "bill");

    this.setSize(16, 16).setDisplaySize(16, 16);
  }

  onPickup(player) {
    player.changeMoney(10);
    this.scene.sound.play(Phaser.Utils.Array.GetRandom(["coin1", "coin2", "coin3", "coin4"]));
    this.destroy();
  }
}

export class DiamondSword extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, "rpgChars", ROGUELIKE_CHARACTERS.SWORD.DIAMOND);
  }

  onPickup(player) {
    player.addToInventory("diamondSword");
    this.scene.registry.events.emit("talk", ["You have obtained the legendary diamond sword!"]);
    this.destroy();
  }
}

export class RunningShoes extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, "rpgChars", ROGUELIKE_CHARACTERS.BOOTS.BLUE);
  }

  onPickup(player) {
    player.addToInventory("runningBoots");

    const z = this.scene.input.keyboard.addKey("Z");
    z.onDown(() => player.setSpeed(300));
    z.onUp(() => player.setSpeed(150));

    this.scene.registry.events.emit("talk", "You have obtained the mythical running shoes! Hold Z to go faster.");
    this.destroy();
  }
}
