import { NPC_DATA } from "../util/npcData.js";
import { Entity } from "./entity.js";

export class NPC extends Entity {
  constructor(scene, x, y, name) {
    super(scene, x, y, NPC_DATA[name].texture || "rpgChars", NPC_DATA[name].frame || undefined, name);
    this.speed = 30;

    this.setSize(16, 16).setDisplaySize(16, 16);

    this.scene.registry.events.on("move_" + this.name, (dx, dy) => {
      const { x, y } = this.body.center;
      this.scene.physics.moveTo(this, x + dx, y + dy, this.speed, 1000);
      this.scene.time.delayedCall(1000, () => this.body.setVelocity(0));
    });
  }
}

export class Policeman extends NPC {
  constructor(scene, x, y) {
    super(scene, x, y, "police");

    this.play("police-moving");
    this.setSize(16, 16)
      .setDisplaySize(16, 32)
      .setOffset(0, 8);

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
