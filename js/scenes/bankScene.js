import Player from "../objects/player.js";
import { Bill, Gun, RunningShoes, Chest, Policeman, Stairs, Sewer } from "../objects/entity.js";
import { TILE_MAPPING as TILES } from "../util/tileMapping.js";

/**
 * Scene that generates a new dungeon
 */
export default class BankScene extends Phaser.Scene {
  constructor() { // This only gets called once
    super({ key: "BankScene" });
    this.level = 2;
    this.numfloors = 5;
  }

  init(data) {
    if (data.level) this.level += 1;
  }

  create() {
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2, 
      rooms: {
        width: { min: 7, max: 15, onlyOdd: true },
        height: { min: 7, max: 15, onlyOdd: true }
      }
    });

    // Help text that has a "fixed" position on the screen
    this.add
      .text(this.cameras.main.width - 5, this.cameras.main.height - 5, `Find the stairs. Go deeper.\nCurrent level: ${this.level}`, {
        font: "16px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(50)
      .setOrigin(1, 1);

    // ==================== CREATING TILEMAP AND LAYERS ====================
    const map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("dungeonTiles", null, 16, 16, 0, 1);
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset).fill(TILES.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
    this.shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).fill(TILES.BLANK).setDepth(30);
    this.activeRoom = null;

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.entities = this.physics.add.group({
      createCallback: item => item.setDepth(25)
    });
    this.bullets = this.physics.add.group();

    // ==================== CREATE ROOMS ====================
    this.dungeon.rooms.forEach(room => this.createRoom(room));
    const rooms = this.dungeon.rooms.slice();

    const startRoom = rooms.shift();
    let { x, y } = map.tileToWorldXY(startRoom.centerX, startRoom.centerY);
    this.player = new Player(this, x, y);

    if (this.level === this.numfloors) {
      rooms.forEach(room => {
        ({x, y} = map.tileToWorldXY(room.centerX, room.centerY));
        this.entities.add(new Policeman(this, x, y));
      });
    } else {
      const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
      ({x, y} = map.tileToWorldXY(endRoom.centerX, endRoom.centerY));
      const stairs = new Stairs(this, x, y);
      this.entities.add(stairs);
      stairs.body.setImmovable();

      [[x, y-1], [x+1, y], [x, y+1], [x-1, y]].forEach((val) => this.stuffLayer.removeTileAt(val[0], val[1]));

      const vaultRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
      const { left, top } = map.tileToWorldXY(vaultRoom.left + 1, vaultRoom.top + 1);
      const { right, bottom } = map.tileToWorldXY(vaultRoom.right, vaultRoom.bottom);
      for (x = left; x < right; x += 32)
        for (y = top; y < bottom; y += 32)
          this.entities.add(new Bill(this, x, y));
  
      const exitRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
      ({x, y} = map.tileToWorldXY(exitRoom.centerX, exitRoom.centerY));
      const sewer = new Sewer(this, x, y);
      this.entities.add(sewer);
      sewer.body.setImmovable();

      Phaser.Utils.Array.Shuffle(rooms);
      for (let i = 0; i < this.level; i++) {
        ({x, y} = map.tileToWorldXY(rooms[i].centerX, rooms[i].centerY));
        this.entities.add(new Policeman(this, x, y));
      } 
    }

    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);
    otherRooms.forEach(room => this.initOtherRoom(room));

    // ==================== COLLISION AND PHYSICS ====================
    this.groundLayer.setCollisionByExclusion(TILES.FLOORTILES);
    this.stuffLayer.setCollisionByExclusion(TILES.FLOORTILES);

    // Watch the player and tilemap layers for collisions, for the duration of the scene:
    this.physics.add.collider([this.player.sprite, this.entities], [this.groundLayer, this.stuffLayer]);
    this.physics.add.collider(this.entities);
    this.physics.add.collider(this.player.sprite, this.entities, (player, npc) => npc.collide(this.player));
    this.physics.add.collider(this.bullets, [this.entities, this.groundLayer, this.stuffLayer], (bullet, entity) => {
      if (entity.hp) entity.hp -= bullet.damage;
      if (entity.hp <= 0) entity.destroy();
      bullet.destroy();
    });

    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pausegame", "BankScene"))
      .on("keyup_ENTER", () => {
        if (this.lastEntityTouched) this.lastEntityTouched.interact(this.player);
      });
  }

  update(time, delta) {
    if (this.player.sprite.body) this.player.update();
    const { x, y } = this.groundLayer.worldToTileXY(this.player.sprite.x, this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(x, y);
    this.setActiveRoom(playerRoom);
  }

  createRoom(room) {
    const { x, y, width, height, left, right, top, bottom } = room;

    this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

    if (this.level > 1) {
      let weightedBones = [];
      for (let i = 0; i < this.numfloors + 3 - this.level; i++)
        weightedBones = weightedBones.concat(TILES.FLOOR);
      this.stuffLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, weightedBones.concat(TILES.BONES));
    }

    this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
    this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
    this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
    this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

    this.groundLayer.weightedRandomize(left + 1, top, width - 2, 1, TILES.WALL.TOP);
    this.groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
    this.groundLayer.weightedRandomize(left, top + 1, 1, height - 2, TILES.WALL.LEFT);
    this.groundLayer.weightedRandomize(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);

    const doors = room.getDoorLocations();
    for (let i = 0; i < doors.length; i++) {
      if (doors[i].y === 0) {
        this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
        this.stuffLayer.removeTileAt(x + doors[i].x, y + doors[i].y + 1);
      } else if (doors[i].y === room.height - 1) {
        this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
        this.stuffLayer.removeTileAt(x + doors[i].x, y + doors[i].y - 1);
      } else if (doors[i].x === 0) {
        this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
        this.stuffLayer.removeTileAt(x + doors[i].x + 1, y + doors[i].y);
      } else if (doors[i].x === room.width - 1) {
        this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
        this.stuffLayer.removeTileAt(x + doors[i].x - 1, y + doors[i].y);
      }
    }
  }

  initOtherRoom(room) {
    const rand = Math.random();
    const { x, y } = this.stuffLayer.tileToWorldXY(room.centerX, room.centerY);

    if (rand <= 0.25) { // 25% chance of chest
      const chest = new Chest(this, x, y);
      this.entities.add(chest);
      chest.body.setImmovable();
    } else if (rand <= 0.5) { // 50% chance of a pot anywhere in the room... except don't block a door!
      const x = Phaser.Math.Between(room.left + 2, room.right - 2);
      const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
      this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
    } else { // 25% of either 2 or 4 towers, depending on the room size
      if (room.height >= 9) {
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
        
        if (!this.registry.get("gun_spawned")) {
          this.entities.add(new Gun(this, x, y));
          this.registry.set("gun_spawned", true);
        }
      } else {
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
        
        if (!this.registry.get("runningShoes_spawned")) {
          this.entities.add(new RunningShoes(this, x, y));
          this.registry.set("runningShoes_spawned", true);
        }
      }
    }
  }

  setActiveRoom(room) {
    // We only need to update the tiles if the active room has changed
    if (room !== this.activeRoom) {
      this.setRoomAlpha(room, 0); // Make the new room visible
      if (this.activeRoom) this.setRoomAlpha(this.activeRoom, 0.5); // Dim the old room
      this.activeRoom = room;
      const {x, y} = this.shadowLayer.tileToWorldXY(room.x, room.y);
      const rect = new Phaser.Geom.Rectangle(x, y, room.width * 16, room.height * 16);
      this.entities.children.iterate(child => {
        if (child.name === "police" && rect.contains(child.body.x, child.body.y))
          child.aggro = true;
      });
    }
  }

  // Helper to set the alpha on all tiles within a room
  setRoomAlpha(room, alpha) {
    this.shadowLayer.forEachTile(t => t.alpha = alpha, this, room.x, room.y, room.width, room.height);
  }

  destroy() {
    this.player.destroy();
    this.entities.destroy();
  }
}
