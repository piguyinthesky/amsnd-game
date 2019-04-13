export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    this.lives = 0;
    this.money = 0;
    this.items = [];
    
    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(10, 16)
      .setOffset(3, 0)
      .setCollideWorldBounds(true);

    this.sprite
      .anims.play("character-front")
      .setCollideWorldBounds(true);
    
    this.keys = scene.input.keyboard.createCursorKeys();

    this.scene.registry.events
    .on("freezeplayer", freeze => this.sprite.body.moves = freeze)
  }
  
  update() {
    const speed = 150;
    
    this.sprite.body.setVelocity(0);
    
    if (this.keys.left.isDown) this.sprite.body.setVelocityX(-speed);
    else if (this.keys.right.isDown) this.sprite.body.setVelocityX(speed);
    
    if (this.keys.up.isDown) this.sprite.body.setVelocityY(-speed);
    else if (this.keys.down.isDown) this.sprite.body.setVelocityY(speed);
    
    this.sprite.body.velocity.normalize().scale(speed);
    
    if (this.keys.left.isDown) this.sprite.anims.play("character-left", true);
    else if (this.keys.right.isDown) this.sprite.anims.play("character-right", true);
    else if (this.keys.up.isDown) this.sprite.anims.play("character-back", true);
    else if (this.keys.down.isDown) this.sprite.anims.play("character-front", true);
    else this.sprite.anims.stop();
  }
  
  destroy() {
    this.sprite.destroy();
  }

  changeMoney(val) {
    this.money += val;
    this.scene.registry.set("money", this.money);
  }

  changeLives(val) {
    this.lives += val;
    this.scene.registry.set("lives", this.lives);
  }
}
