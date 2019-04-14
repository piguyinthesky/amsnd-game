export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, lines="Debugging") {
    super(scene, x, y, texture, frame);

    this.lines = lines;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    if (texture === "rpgChars")
      this.setSize(16, 16)
        .setDisplaySize(16, 16);
  }

  collide(player) {}

  interact(player) {
    this.talk();
  }

  talk(lines=this.lines) {
    this.scene.registry.events.emit("talk", lines);
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
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.scene.physics.moveToObject(this, this.scene.player.sprite, this.speed);
  }
}
