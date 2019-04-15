import Player from "../objects/player.js";
import { Bill, DiamondSword, RunningShoes } from "../objects/item.js";
import { TILE_MAPPING as TILES } from "../util/tileMapping.js";
import TilemapVisibility from "../util/tilemapVisibility.js";
import { Policeman } from "../objects/npc.js";
import { Chest } from "../objects/objects.js";

/**
 * Scene that generates a new dungeon
 */
export default class BankScene extends Phaser.Scene {
  constructor() { // This only gets called once
    super({ key: "BankScene" });
    this.level = 0;
  }

  create() {
    this.level++;
    this.hasPlayerReachedStairs = false;

    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2, 
      rooms: {
        width: { min: 7, max: 15, onlyOdd: true },
        height: { min: 7, max: 15, onlyOdd: true }
      }
    });

    // ==================== CREATING TILEMAP AND LAYERS ====================
    const map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("dungeonTiles", null, 48, 48, 1, 2);
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset).fill(TILES.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
    const shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).fill(TILES.BLANK).setDepth(30);
    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.items = this.physics.add.group({
      createCallback: item => item.setDepth(25)
    });
    this.npcs = this.physics.add.group();

    // ==================== CREATE ROOMS ====================
    this.dungeon.rooms.forEach(room => this.createRoom(room));

    const rooms = this.dungeon.rooms.slice();

    const startRoom = rooms.shift();
    let x = map.tileToWorldX(startRoom.centerX);
    let y = map.tileToWorldY(startRoom.centerY);
    this.player = new Player(this, x, y);

    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);

    const vaultRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const left = map.tileToWorldX(vaultRoom.left + 1);
    const right = map.tileToWorldX(vaultRoom.right - 1);
    const top = map.tileToWorldY(vaultRoom.top + 1);
    const bottom = map.tileToWorldY(vaultRoom.bottom - 1);
    for (x = left; x < right; x += 32)
      for (y = top; y < bottom; y += 32)
        this.items.add(new Bill(this, x, y), true);

    const exitRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    this.stuffLayer.putTileAt(TILES.STAIRS, exitRoom.centerX, exitRoom.top);
    x = map.tileToWorldX(exitRoom.centerX);
    y = map.tileToWorldY(exitRoom.centerY);
    this.npcs.add(new Policeman(this, x, y), true);

    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);
    otherRooms.forEach(room => this.initOtherRoom(room));

    // ==================== COLLISION AND PHYSICS ====================
    this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
    this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

    this.stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
      this.hasPlayerReachedStairs = true;
      this.registry.events.emit("freezeplayer", true);
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.restart();
      });
    });

    // Watch the player and tilemap layers for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, [this.groundLayer, this.stuffLayer]);
    this.physics.add.collider(this.npcs);
    this.physics.add.collider(this.player.sprite, this.npcs, (player, npc) => {
      npc.collide(this.player);
    });
    this.physics.add.collider(this.player.sprite, this.items, (player, item) => item.onPickup(this.player));

    this.cameras.main
      .setZoom(2)
      .startFollow(this.player.sprite)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    this.input.keyboard
      .on("keyup_ESC", () => this.registry.events.emit("pausegame", "BankScene"));
  }

  update(time, delta) {
    if (this.hasPlayerReachedStairs) return;

    this.player.update();

    const { x, y } = this.groundLayer.worldToTileXY(this.player.sprite.x, this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(x, y);

    this.tilemapVisibility.setActiveRoom(playerRoom);
  }

  createRoom(room) {
    const { x, y, width, height, left, right, top, bottom } = room;

    this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

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
      if (doors[i].y === 0)
        this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
      else if (doors[i].y === room.height - 1)
        this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
      else if (doors[i].x === 0)
        this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
      else if (doors[i].x === room.width - 1)
        this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
    }
  }

  initOtherRoom(room) {
    const rand = Math.random();
    if (rand <= 0.25) { // 25% chance of chest
      const { x, y } = this.stuffLayer.tileToWorldXY(room.centerX, room.centerY);
      this.npcs.add(new Chest(this, x, y), true)
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
        
        const { x, y } = this.stuffLayer.tileToWorldXY(room.centerX, room.centerY);
        this.items.add(new DiamondSword(this, x, y), true);
      } else {
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
        this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
        const { x, y } = this.stuffLayer.tileToWorldXY(room.centerX, room.centerY);
        this.items.add(new RunningShoes(this, x, y), true);
      }
    }
  }
}
