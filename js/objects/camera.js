const TEXTURES = {
  camera: "camera1"
}

export default class Camera extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, TEXTURES[type]);
    
  }

  canSeePlayer(player) {
    
  }
}