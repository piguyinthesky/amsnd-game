const STILL = 0, UP = 1, RIGHT = 2, DOWN = 3, LEFT = 4;

export default class NPC {
  constructor(scene, x, y, name) {
    this.scene = scene;

    this.sprite = this.scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(22, 33)
      .setOffset(23, 27);

    this.sprite.anims.play("player-walk-back");

    this.dx = 0;
    this.dy = 0;
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update() {
    const sprite = this.sprite;
    const speed = 300;
    const prevVelocity = sprite.body.velocity.clone();

    // Stop any previous movement from the last frame
    sprite.body.setVelocity(0);

    // Horizontal movement
    if (this.dx === LEFT) {
      sprite.body.setVelocityX(-speed);
      sprite.setFlipX(true);
    } else if (this.dx === RIGHT) {
      sprite.body.setVelocityX(speed);
      sprite.setFlipX(false);
    }

    // Vertical movement
    if (this.dy === UP)
      sprite.body.setVelocityY(-speed);
    else if (this.dy === DOWN)
      sprite.body.setVelocityY(speed);

    // Normalize and scale the velocity so that sprite can't move faster along a diagonal
    sprite.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (keys.left.isDown || keys.right.isDown || keys.down.isDown) {
      sprite.anims.play("player-walk", true);
    } else if (keys.up.isDown) {
      sprite.anims.play("player-walk-back", true);
    } else {
      sprite.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.y < 0) sprite.setTexture("characters", 65);
      else sprite.setTexture("characters", 46);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
