const TEXTURES = {
  camera: "camera1"
};

export default class Camera {
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.image(x, y, "camera")
      .setSize(16, 16)
      .setDisplaySize(16, 16)
      .setOffset(0, 0);
  }

  destroy() {
    this.sprite.destroy();
  }
}
