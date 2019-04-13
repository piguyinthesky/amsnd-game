export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.npcType = texture;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    if (texture === "rpg-characters") {
      this.setSize(16, 16)
        .setDisplaySize(16, 16);
    }
  
    this.setCollideWorldBounds(true);
  }

  collide(player) {
    this.talk(this.lines);
  }

  talk(lines) {
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
    this.player.changeLives(-1);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.scene.physics.moveToObject(this, this.scene.player.sprite, this.speed);
  }
}
