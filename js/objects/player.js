export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    this.lives = 0;
    this.money = 0;
    this.items = [];
    
    let i = 0;
    ["front", "back", "left", "right"].forEach(dir => {
      this.scene.anims.create({
        key: dir,
        frames: this.scene.anims.generateFrameNumbers("character", { frames: [i, i + 1, i, i + 2] }),
        frameRate: 5,
        repeat: -1
      });
      i += 3;
    });
    
    scene.registry.set("money", 0);
    scene.registry.set("items", []);
    
    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(16, 16)
      .setOffset(0, 0);
    
    this.sprite.anims.play("back");
    
    this.keys = scene.input.keyboard.createCursorKeys();
  }
  
  freeze() {
    this.sprite.body.moves = false;
  }
  
  update() {
    const speed = 300;
    
    this.sprite.body.setVelocity(0);
    
    if (this.keys.left.isDown) this.sprite.body.setVelocityX(-speed);
    else if (this.keys.right.isDown) this.sprite.body.setVelocityX(speed);
    
    if (this.keys.up.isDown) this.sprite.body.setVelocityY(-speed);
    else if (this.keys.down.isDown) this.sprite.body.setVelocityY(speed);
    
    this.sprite.body.velocity.normalize().scale(speed);
    
    if (this.keys.left.isDown) this.sprite.anims.play('left', true);
    else if (this.keys.right.isDown) this.sprite.anims.play('right', true);
    else if (this.keys.up.isDown) this.sprite.anims.play('back', true);
    else if (this.keys.down.isDown) this.sprite.anims.play('front', true);
    else this.sprite.anims.stop();
  }
  
  destroy() {
    this.sprite.destroy();
  }
}
