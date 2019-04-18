import { NPC_DATA } from "../util/npcData.js";

export class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, name) {
    super(scene, x, y, texture, frame);
    this.setName(name);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.lines = NPC_DATA[name] ? NPC_DATA[name].lines: undefined;
  }

  collide(player) {
    this.scene.lastEntityTouched = this;
    this.scene.time.clearPendingEvents();
    this.scene.time.delayedCall(1500, () => this.scene.lastEntityTouched = null); // Since I couldn't figure out how to check when they stop colliding, we just assume the user will interact with the npc within 1.5 seconds; if they press enter later it'll still work
  }
  
  interact(player) {
    this.scene.registry.events.emit("talk", this.lines);
  }
}


export class InteractiveObject extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, name) {
    super(scene, x, y, width, height);
    this.setName(name);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.lines = NPC_DATA[name] ? NPC_DATA[name].lines : undefined;
    this.setOrigin(0, 0);
  }

  collide(player) {
    this.scene.lastEntityTouched = this;
    this.scene.time.clearPendingEvents();
    this.scene.time.delayedCall(1500, () => this.scene.lastEntityTouched = null); // Since I couldn't figure out how to check when they stop colliding, we just assume the user will interact with the npc within 1.5 seconds; if they press enter later it'll still work
  }
  
  interact(player) {
    this.scene.registry.events.emit("talk", this.lines);
  }
}
