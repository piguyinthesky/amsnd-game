import { NPC_DATA } from "../util/npcData.js";
import { ROGUELIKE_CHARACTERS } from "../util/tileMapping.js";
import { TILE_MAPPING } from "../util/tileMapping.js";

export class Entity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, NPC_DATA[name].texture, NPC_DATA[name].frame);
    this.setName(name);
    this.lines = NPC_DATA[name].lines;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.scene.registry.events.on("move_" + this.name, (dx, dy) => {
      const { x, y } = this.body.center;
      this.scene.physics.moveTo(this, x + dx, y + dy, this.speed, 1000);
      this.scene.time.delayedCall(1000, () => this.body.setVelocity(0));
    });
  }

  collide(player) {
    this.scene.lastEntityTouched = this;
    this.scene.time.clearPendingEvents();
    this.scene.time.addEvent({
      delay: 1500,
      callback: () => this.scene.lastEntityTouched = null
    }); // Since I couldn't figure out how to check when they stop colliding, we just assume the user will interact with the npc within 1.5 seconds; if they press enter later it'll still work
  }
  
  interact(player) {
    this.scene.registry.events.emit("talk", this.lines);
  }
}

export class Policeman extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "police");

    this.play("police-moving");
    this.setSize(16, 16)
      .setDisplaySize(16, 32)
    this.body.setOffset(0, 8);

    this.speed = 100;
  }

  collide(player) {
    this.scene.registry.values.lives--;
    this.scene.registry.events.emit("switchscene", "BankScene", "MainScene");
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.scene.physics.moveToObject(this, this.scene.player.sprite, this.speed);
  }
}

export class Bill extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "bill");

    this.setSize(16, 16).setDisplaySize(16, 16);
    this.setOrigin(0.5, 0.5);
  }

  collide(player) {
    this.scene.registry.values.money += 10;
    this.scene.sound.play(Phaser.Utils.Array.GetRandom(["coin1", "coin2", "coin3", "coin4"]));
    this.destroy();
  }
}

export class DiamondSword extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "diamondSword");
  }

  collide(player) {
    this.scene.registry.events.emit("addtoinventory", "diamondSword");
    this.scene.registry.events.emit("talk", this.lines);
    this.destroy();
  }
}

export class RunningShoes extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "runningShoes");
  }

  collide(player) {
    this.scene.registry.events.emit("addtoinventory", "runningShoes");
    this.scene.registry.events.emit("talk", this.lines);
    this.destroy();
  }
}

export class Chest extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "chest");
    this.setOrigin(0, 0);
    this.setSize(16, 16).setDisplaySize(16, 16);
  }

  interact(player) {
    if (this.opened) return;
    this.scene.registry.values.money += 1000;
    this.scene.registry.events.emit("talk", this.lines);
    this.opened = true;
  }
}
