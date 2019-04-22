import { Bullet } from "./entity.js";
import { NPC_DATA } from "../util/npcData.js";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    const data = NPC_DATA[this.scene.registry.values.name.toLowerCase()];
    this.sprite = scene.physics.add
      .sprite(x, y, data.texture, data.frame)
      .setSize(10, 16)
      .setOffset(3, 0)
      .setDepth(5)
      .setCollideWorldBounds(true);

    this.keys = scene.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,W,A,S,D");
    this.shootDelay = 500;
    this.lastShot = 0;
  }
  
  update() {
    this.sprite.body.setVelocity(0);
    this.speed = (this.keys.SHIFT.isDown && this.scene.registry.get("inventory").indexOf("runningShoes") > -1) ? 300 : 150;
    
    if (this.keys.LEFT.isDown || this.keys.A.isDown)
      this.sprite.body.setVelocityX(-this.speed);
    else if (this.keys.RIGHT.isDown || this.keys.D.isDown)
      this.sprite.body.setVelocityX(this.speed);
    
    if (this.keys.UP.isDown || this.keys.W.isDown)
      this.sprite.body.setVelocityY(-this.speed);
    else if (this.keys.DOWN.isDown || this.keys.S.isDown)
      this.sprite.body.setVelocityY(this.speed);
    
    this.sprite.body.velocity.normalize().scale(this.speed);
  }
  
  destroy() {
    this.sprite.destroy();
  }
}
