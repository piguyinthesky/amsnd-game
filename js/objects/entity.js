import { NPC_DATA } from "../util/npcData.js";

export class Entity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name) {
    const data = NPC_DATA[name];
    if (!data) console.error(name);
    super(scene, x, y, data.texture, data.frame);
    this.setName(name);

    this.lines = data.lines;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.scene.registry.events.on("move_" + this.name, (dx, dy) => {
      const { x, y } = this.body.center;
      this.scene.physics.moveTo(this, x + dx, y + dy, this.speed, 1000);
      this.scene.time.delayedCall(1000, () => this.body.setVelocity(0));
    });

    this.hp = 1000;
  }

  collide() {
    this.scene.lastEntityTouched = this;
    this.scene.time.clearPendingEvents();
    this.scene.time.addEvent({
      delay: 1500,
      callback: () => this.scene.lastEntityTouched = null
    }); // Since I couldn't figure out how to check when they stop colliding, we just assume the user will interact with the npc within 1.5 seconds; if they press enter later it'll still work
  }
  
  interact() {
    this.scene.registry.events.emit("talk", this.lines);
  }
}
