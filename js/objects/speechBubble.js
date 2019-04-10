export default class SpeechBubble {
  constructor(scene, text) {
    this.scene = scene;
    this.text = text;

    const { width, height } = scene.cameras.main;
    const padding = { x: width / 64, y: height / 32 };

    const img = scene.add.image(padding.x, height - padding.y, "textBox")
      .setDisplaySize(width - padding.x * 2, height / 3)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(30)

    const border = { x: img.displayWidth * 4 / 190, y: img.displayHeight * 4 / 49 };
    const tl = img.getTopLeft();
        
    this.displayText = scene.add.text(tl.x, tl.y, "", {
      font: "12px monospace",
      fill: "black",
      wordWrap: { width: img.displayWidth - border.x * 4 },
      padding: { x: border.x * 2, y: border.y * 2 }
    }).setScrollFactor(0)
      .setDepth(31);

    this.speed = 50;
    this.timer = 0;
    this.i = 0;
    this.finished = false;
  }

  update(time, delta) {
    if (this.finished) return;

    this.timer += delta;
    if (this.timer < this.speed) return;

    this.timer %= this.speed;

    const current = this.displayText.text.concat(this.text[this.i]);
    this.i++;
    
    if (this.i === this.text.length)
      this.finished = true;
    
    this.displayText.setText(current);
  }
}