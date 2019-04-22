import { NPC_DATA } from "../util/npcData.js";

export class Entity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name) {
    const data = NPC_DATA[name];
    if (!data) console.error(name);
    super(scene, x, y, data.texture, data.frame);
    this.setName(name);

    this.lines = data.lines;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.scene.registry.events.on("move_" + this.name, (dx, dy) => {
      const { x, y } = this.body.center;
      this.scene.physics.moveTo(this, x + dx, y + dy, this.speed, 1000);
      this.scene.time.delayedCall(1000, () => this.body.setVelocity(0));
    });

    this.hp = 1000;
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

// NPCs

export class Policeman extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "police");

    this.play("police-moving");
    this.body.setSize(16, 16).setOffset(0, 8);
    this.setDisplaySize(16, 32);

    this.speed = 100;
    this.damage = 100;
    this.aggro = false;
  }

  collide(player) {
    this.scene.registry.values.hp -= this.damage;
    this.scene.physics.moveTo(this, this.x + (this.x - player.sprite.x) * 2, this.y + (this.y - player.sprite.y) * 2, 60, 100);
    this.scene.time.delayedCall(100, () => {
      this.body.setVelocity(0);
      this.recoil = false;
    });
    this.recoil = true;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.aggro && !this.recoil) this.scene.physics.moveToObject(this, this.scene.player.sprite, this.speed);
  }
}

// Objects

export class Chest extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "chest");
    this.setOrigin(0, 0);
    this.setSize(16, 16).setDisplaySize(16, 16);
  }

  interact(player) {
    if (this.opened) return;
    const amt = Phaser.Math.Between(300, 500);
    this.scene.registry.values.money += amt;
    this.scene.registry.events.emit("talk", "You found $" + amt);
    this.opened = true;
    this.setTexture(NPC_DATA.chest.texture, NPC_DATA.chest.openFrame);
  }
}

export class Sewer extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "sewer");
    this.setOrigin(0, 0).setDisplaySize(16, 16);
  }
}

export class Stairs extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "stairs");
    this.setOrigin(0, 0).setDisplaySize(16, 16);
  }
}

export class Bullet extends Entity {
  constructor(scene, x, y, direction) {
    super(scene, x, y, "bullet");
    this.damage = 100;
    this.body.setSize(5, 5).setOffset(5);
    this.scene.sound.play("shoot");
  }
}

// Items

export class Bill extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "bill");
    this.setDisplaySize(16, 16);
  }

  collide(player) {
    this.scene.registry.values.money += 10;
    this.scene.sound.play(Phaser.Utils.Array.GetRandom(["coin1", "coin2", "coin3", "coin4"]));
    this.destroy();
  }
}

export class Gun extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "gun");
    this.setOrigin(0);
  }

  collide(player) {
    this.scene.registry.events.emit("addtoinventory", "gun");
    this.scene.registry.events.emit("talk", this.lines);
    this.destroy();
  }
}

export class RunningShoes extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "runningShoes");
    this.setOrigin(0);
  }

  collide(player) {
    this.scene.registry.events.emit("addtoinventory", "runningShoes");
    this.scene.registry.events.emit("talk", this.lines);
    this.destroy();
  }
}
