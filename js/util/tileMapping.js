// Our custom tile mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILESET_WIDTH = 8;
const TILESET_HEIGHT = 8;

const c = (r, c) => r * TILESET_WIDTH + c;

export const TILE_MAPPING = {
  BLANK: c(1, 1),
  WALL: {
    TOP_LEFT: c(0, 3),
    TOP_RIGHT: c(0, 4),
    BOTTOM_LEFT: c(1, 3),
    BOTTOM_RIGHT: c(1, 4),
    TOP: [{ index: c(2, 1), weight: 4 }, { index: [c(3, 0), c(3, 1), c(3, 2)], weight: 1 }],
    LEFT: [{ index: c(1, 2), weight: 4 }, { index: [c(4, 0), c(5, 0), c(6, 0)], weight: 1 }],
    RIGHT: [{ index: c(1, 0), weight: 4 }, { index: [c(4, 2), c(5, 2), c(6, 2)], weight: 1 }],
    BOTTOM: [{ index: c(0, 1), weight: 4 }, { index: [c(7, 0), c(7, 1), c(7, 2)], weight: 1 }]
  },
  FLOOR: [{ index: c(4, 5), weight: 9 }, { index: [c(1, 5), c(1, 6), c(2, 5), c(2, 6), c(3, 5), c(3, 6)], weight: 1 }],
  FLOORTILES: [-1, c(4, 5), c(1, 5), c(1, 6), c(2, 5), c(2, 6), c(3, 5), c(3, 6)],
  POT: [{ index: c(5, 6), weight: 1 }, { index: c(5, 7), weight: 1 }, { index: c(6, 6), weight: 1 }, { index: c(6, 7), weight: 1 }],
  DOOR: {
    TOP: [c(2, 2), c(4, 5), c(2, 0)],
    LEFT: [
      [c(2, 2)], 
      [c(4, 5)], 
      [c(0, 2)]
    ],
    BOTTOM: [c(0, 2), c(4, 5), c(0, 0)],
    RIGHT: [
      [c(2, 0)], 
      [c(4, 5)], 
      [c(0, 0)]
    ]
  },
  CHEST: [{ index: c(4, 3), weight: 1 }, { index: c(4, 4), weight: 1 }],
  STAIRS: 6,
  COIN_PILE: [{ index: c(7, 3), weight: 5 }, { index: c(7, 4), weight: 2 }, { index: c(7, 5), weight: 1 }],
  TOWER: [
    [c(2, 3)],
    [c(3, 3)]
  ]
};

export const ROGUELIKE_CHARACTERS = {
  SWORD: {
    WOOD: 366,
    BRONZE: 367,
    IRON: 368,
    GOLD: 369,
    DIAMOND: 370
  },
  BOOTS: {
    BLUE: 328
  }
};