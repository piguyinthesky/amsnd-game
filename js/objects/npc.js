import { NPC_DATA } from "../util/npcData.js";

export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, NPC_DATA[name].texture || "rpgChars", NPC_DATA[name].frame || undefined);
    this.name = name;
    this.lines = NPC_DATA[name].lines;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.speed = 30;

    this.setSize(16, 16).setDisplaySize(16, 16);

    this.scene.registry.events.on("move_" + this.name, (x, y) => {
      this.scene.physics.moveTo(this, this.x + x, this.y + y, this.speed);
    });
  }

  collide(player) {}

  interact(player) {
    this.talk();
  }

  talk() {
    this.scene.registry.events.emit("talk", this.lines);
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
