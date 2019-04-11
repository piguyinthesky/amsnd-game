import SpeechBubble from "./speechBubble";

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, lines) {
    super(scene, x, y, texture, frame);

    this.lines = lines;

    this
      .setSize(16, 16)
      .setDisplaySize(16, 32)
      .setOffset(0, 16)
      .setCollideWorldBounds(true);

    this.anims.play("police-moving");
  }

  talk() {
    this.scene.speechBubble
  }

  preUpdate() {
    const speed = 100;

    this.scene.physics.moveToObject(this, this.scene.player.sprite, speed);
  }
}
