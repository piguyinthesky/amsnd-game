const TEXTURES = {
  bill: "bill"
};

Phaser;

export default class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, TEXTURES[type]);
    // this.setTexture(TEXTURES[type]);
    // this.setPosition(x, y);
    
    if (this.type === "bill") {
      this.originalY = y;
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.type === "bill") {
      this.y = this.originalY + Math.sin(time);
    }
  }
}