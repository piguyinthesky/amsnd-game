import { Bullet } from "./entity.js";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(10, 16)
      .setOffset(3, 0)
      .setDepth(5)
      .setCollideWorldBounds(true);
    
    this.sprite.anims.play("character-front");
    this.direction = "down";

    this.keys = scene.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,W,A,S,D");
    this.shootDelay = 500;
    this.lastShot = 0;
  }
  
  update() {
    this.sprite.body.setVelocity(0);
    this.speed = (this.keys.SHIFT.isDown && this.scene.registry.get("inventory").indexOf("runningShoes") > -1) ? 300 : 150;
    
    if (this.scene.registry.get("inventory").includes("gun") && this.keys.SPACE.isDown && this.scene.time.now - this.lastShot > this.shootDelay)
      this.shoot();
    
    if (this.keys.LEFT.isDown || this.keys.A.isDown)
      this.sprite.body.setVelocityX(-this.speed);
    else if (this.keys.RIGHT.isDown || this.keys.D.isDown)
      this.sprite.body.setVelocityX(this.speed);
    
    if (this.keys.UP.isDown || this.keys.W.isDown)
      this.sprite.body.setVelocityY(-this.speed);
    else if (this.keys.DOWN.isDown || this.keys.S.isDown)
      this.sprite.body.setVelocityY(this.speed);
    
    this.sprite.body.velocity.normalize().scale(this.speed);
    
    if (this.keys.LEFT.isDown || this.keys.A.isDown) {
      this.sprite.anims.play("character-left", true);
      this.direction = "left";
    } else if (this.keys.RIGHT.isDown || this.keys.D.isDown) {
      this.sprite.anims.play("character-right", true);
      this.direction = "right";
    } else if (this.keys.UP.isDown || this.keys.W.isDown) {
      this.sprite.anims.play("character-back", true);
      this.direction = "up";
    } else if (this.keys.DOWN.isDown || this.keys.S.isDown) {
      this.sprite.anims.play("character-front", true);
      this.direction = "down";
    } else this.sprite.anims.stop();
  }
  
  destroy() {
    this.sprite.destroy();
  }

  shoot() {
    const vecs = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 }
    };
    const {x, y} = vecs[this.direction];
    const bullet = new Bullet(this.scene, this.sprite.x, this.sprite.y, this.direction);
    this.scene.bullets.add(bullet);
    this.scene.physics.moveTo(bullet, this.sprite.x + x, this.sprite.y + y, 500);
    this.lastShot = this.scene.time.now;
  }
}
