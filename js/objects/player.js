export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(10, 16)
      .setOffset(3, 0)
      .setDepth(5)
      .setCollideWorldBounds(true);

    this.sprite
      .anims.play("character-front");

    this.keys = scene.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,SHIFT,W,A,S,D");
  }
  
  update() {
    this.sprite.body.setVelocity(0);

    this.speed = (this.keys.SHIFT.isDown && this.scene.registry.get("inventory").indexOf("runningShoes") > -1) ? 300 : 150;
    
    if (this.keys.LEFT.isDown || this.keys.A.isDown) this.sprite.body.setVelocityX(-this.speed);
    else if (this.keys.RIGHT.isDown || this.keys.D.isDown) this.sprite.body.setVelocityX(this.speed);
    
    if (this.keys.UP.isDown || this.keys.W.isDown) this.sprite.body.setVelocityY(-this.speed);
    else if (this.keys.DOWN.isDown || this.keys.S.isDown) this.sprite.body.setVelocityY(this.speed);
    
    this.sprite.body.velocity.normalize().scale(this.speed);
    
    if (this.keys.LEFT.isDown || this.keys.A.isDown) this.sprite.anims.play("character-left", true);
    else if (this.keys.RIGHT.isDown || this.keys.D.isDown) this.sprite.anims.play("character-right", true);
    else if (this.keys.UP.isDown || this.keys.W.isDown) this.sprite.anims.play("character-back", true);
    else if (this.keys.DOWN.isDown || this.keys.S.isDown) this.sprite.anims.play("character-front", true);
    else this.sprite.anims.stop();
  }
}
