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
    
    this.keys = scene.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,ENTER");

    this.scene.registry.events
    .on("freezeplayer", freeze => {
      console.log("Frozen: " + freeze);
      this.sprite.body.moves = !freeze;
    });
  }
  
  update() {
    const speed = 150;
    
    this.sprite.body.setVelocity(0);
    
    if (this.keys.LEFT.isDown) this.sprite.body.setVelocityX(-speed);
    else if (this.keys.RIGHT.isDown) this.sprite.body.setVelocityX(speed);
    
    if (this.keys.UP.isDown) this.sprite.body.setVelocityY(-speed);
    else if (this.keys.DOWN.isDown) this.sprite.body.setVelocityY(speed);
    
    this.sprite.body.velocity.normalize().scale(speed);
    
    if (this.keys.LEFT.isDown) this.sprite.anims.play("character-left", true);
    else if (this.keys.RIGHT.isDown) this.sprite.anims.play("character-right", true);
    else if (this.keys.UP.isDown) this.sprite.anims.play("character-back", true);
    else if (this.keys.DOWN.isDown) this.sprite.anims.play("character-front", true);
    else this.sprite.anims.stop();

    // console.log(this.sprite.body.touching)
    // console.log(this.sprite.body.wasTouching)
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
