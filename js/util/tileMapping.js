// Our custom tile mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILESET_WIDTH = 10;

const c = (r, c) => r * TILESET_WIDTH + c;

export const TILE_MAPPING = {
  BLANK: c(1, 1),
  BULLET: c(0, 9),
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
  FLOORTILES: [-1, c(1, 5), c(1, 6), c(2, 5), c(2, 6), c(3, 5), c(3, 6), c(4, 5), c(4, 6), c(4, 7)],
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
  CHEST: {
    CLOSED: [{ index: c(4, 3), weight: 1 }, { index: c(4, 4), weight: 1 }, { index: [c(5, 3), c(5, 4)], weight: 1 }, { index: [c(6, 3), c(6, 4)], weight: 1 }],
    OPEN: [{ index: c(6, 8), weight: 1 }, { index: c(6, 8), weight: 1 }, { index: [c(5, 8), c(5, 9)], weight: 1 }, { index: [c(5, 8), c(5, 9)], weight: 1 }]
  },
  STAIRS: 6,
  COIN_PILE: [{ index: c(7, 3), weight: 5 }, { index: c(7, 4), weight: 2 }, { index: c(7, 5), weight: 1 }],
  TOWER: [
    [c(2, 3)],
    [c(3, 3)]
  ],
  SEWER: c(3, 7),
  BONES: [{ index: [c(1, 7), c(2, 9)], weight: 1 }, { index: [c(1, 8), c(2, 8)], weight: 1 }, { index: [c(1, 9), c(2, 7)], weight: 1 }, { index: [c(4, 6), c(4, 7)], weight: 2 }]
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