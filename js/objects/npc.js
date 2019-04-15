import { NPC_DATA } from "../util/npcData.js";

export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, NPC_DATA[name].TEXTURE || undefined, NPC_DATA[name].FRAME || undefined);
    this.name = name;
    this.lines = NPC_DATA[name].LINES;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setSize(16, 16).setDisplaySize(16, 16);
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
    this.setSize(16, 24)
      .setDisplaySize(16, 32)
      .setOffset(0, 12);

    this.speed = 100;
  }

  collide(player) {
    player.changeLives(-1);
    this.scene.registry.events.emit("switchscene", "BankScene", "MainScene");
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.scene.physics.moveToObject(this, this.scene.player.sprite, this.speed);
  }
}
