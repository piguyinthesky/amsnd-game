import { ROGUELIKE_CHARACTERS, TILE_MAPPING } from "./tileMapping.js";

function YesNo(question, yes, no) {
  return [
    {
      text: question,
      options: ["Yes", "No"]
    },
    (infoScene, response) => {
      if (response === "Yes") yes(infoScene);
      else if (response === "No") no(infoScene);
    }
  ];
}

export const NPC_DATA = {
  nothing: { lines: undefined }, // Means it won't show

  // NPCs

  librarian: {
    texture: "rpgChars",
    frame: 271,
    lines: [
      infoScene => {
        if (infoScene.registry.get("name")) {
          if (infoScene.registry.get("inventory").includes("gun"))
            return "My gosh my golly, you actually did go and get it! Congrats, you just got 1000 points! (jk, the only actual score system is your money.)";
          else
            return "What are you waiting for? If you keep loitering, I'm going to start charing fees...";
        } else {
          return [
            {
              text: "Hey, what's your name?",
              options: [
                "Alice",
                "Bob",
                "non-binary"
              ]
            },
            (infoScene, response) => {
              infoScene.registry.set("name", response);
              return [
                `Hey there ${response}, how do you do? I'm the librarian, I'll be here to help out.`,
                "But before I tell you anything, I have this strange feeling that mailbox has something important you should read inside it. Go walk up to it and press E, whatever that means!"
              ];
            }
          ];
        }
      }
    ]
  },
  merchant: {
    texture: "rpgChars",
    frame: 325,
    lines: [
      {
        text: "Hey, I'm the merchant. What're you looking for?",
        options: [
          "Buy",
          "Sell"
        ]
      },
      (infoScene, response) => {
        if (response === "Buy")
          return [
            {
              text: "Sounds good. What're you looking for?",
              options: [
                "$5 - Candy",
                "$10 - Rare Candy"
              ]
            }
          ];
      }
    ]
  },
  npcBlood: {
    texture: "rpgChars",
    lines: "Hey, have you noticed that some of these bills have bloodstains on them?"
  },
  npcHairpin: {
    texture: "rpgChars",
    frame: 379,
    lines: "Where did my hairpin go? Did you steal it from me?"
  },
  npcMysterious: {
    texture: "rpgChars",
    frame: 270,
    lines: "Who's being mysterious? I'm not being mysterious!"
  },// Builtin NPCs: 270, 271, 324, 325, 378 ... 594, 595
  npcName: {
    texture: "rpgChars",
    frame: 324,
    lines: infoScene => {
      return [
        {
          text: "Hey, what's your name?",
          options: infoScene.registry.get("name")
        },
        "Oh, actually I don't really care. Nice to meet you, though!"
      ];
    }
  },
  npcRude: {
    texture: "rpgChars",
    frame: 325,
    lines: "Get out of the way, you little dingus!"
  },
  police: {},

  // Objects

  bank: {
    lines: [
      infoScene => {
        if (infoScene.registry.get("inventory").includes("hairpin"))
          return [
            {
              text: "With a satisfying click, you get the hairpin into the door. Enter the bank?",
              options: ["Yes", "No"]
            },
            (infoScene, response) => {
              if (response === "Yes") infoScene.registry.events.emit("switchscene", "MainScene", "BankScene");
              else return "You pull the hairpin back out of the door.";
            }
          ];
        else
          return "The bank seems to be closed. The doors are locked. Maybe you need something to unlock it...";
      }
    ]
  },
  bush1: {
    lines: YesNo("These are some rather pretty flowers. Would you like to look through them?", infoScene => {
      infoScene.registry.values.money += 1;
      return "You find a few loose coins and a lot of litter.";
    })
  },
  bush2: {
    lines: infoScene => {
      if (infoScene.registry.get("inventory").includes("hairpin")) {
        return [
          {
            text: "These are some rather pretty flowers. Would you like to look through them?",
            options: ["Yes", "No"]
          },
          (infoScene, response) => {
            if (response === "Yes") {
              infoScene.registry.values.money += 1;
              return "You find a few loose coins and a lot of litter.";
            }
          }
        ];
      } else {
        return [
          {
            text: "These are some rather pretty flowers. Would you look through them?",
            options: ["Yes", "No"]
          },
          (infoScene, response) => {
            if (response === "Yes") {
              infoScene.registry.events.emit("addtoinventory", "hairpin");
              return "Among the litter, you notice a small hairpin.";
            }
          }
        ];
      }
    }
  },
  bullet: {
    texture: "dungeonTileset",
    frame: TILE_MAPPING.BULLET
  },
  car: {
    lines: "It's a locked car."
  },
  house: {
    lines: "The doors to your own house have been forced back into the frame. They do not open."
  },
  locked: {
    lines: "These doors are closed!"
  },
  mailbox: {
    lines: infoScene => {
      if (infoScene.registry.get("inventory").includes("letter"))
        return "The mailbox is empty.";
      else
        return [
          "To whom it may concern,",
          "Hello! I hope this letter reaches you well.\nI am writing to tell you that your mother has been taken hostage.\nAll we ask for in return is a ransom of 1 million dollars. That is, $1 000 000.",
          "For a scrub like you who does not receive income, we understand that this money may be difficult to come by. But fear not! We, the world's most kind and generous kidnappers, have some tips, from our generous experience of theft and thievery.",
          "First of all, GO ROB THE BANK.\nUh, that's it, really. There's not much fun in burgling old nannies on the street",
          "But before you brave the mysterious secrets of this city of locked doors, there are a few things you must know.",
          "This may not make sense to you, but the otherworldly powers tell me to say this.\nUse the WASD keys to move. Press E to interact. When the time comes, we hope you'll know what to do.",
          "Thank you for your time!\nP.S. Don't try to come and find us.",
          infoScene => {
            infoScene.registry.events.emit("addtoinventory", "letter");
            infoScene.registry.events.emit("move_librarian", 0, 32);
          }
        ];
    }
  },
  sewer: {
    texture: "dungeonTileset",
    frame: TILE_MAPPING.SEWER,
    lines: [
      {
        text: "Climb into the sewer?",
        options: ["Yes", "No"]
      },
      (infoScene, response) => {
        if (response === "Yes") {
          infoScene.registry.events.emit("switchscene", "BankScene", "MainScene", { fromSewer: true });
        }
      }
    ]
  },
  stairs: {
    texture: "dungeonTileset",
    frame: TILE_MAPPING.STAIRS,
    lines: [
      {
        text: "Go down the stairs?",
        options: ["Yes", "No"]
      },
      (infoScene, response) => {
        if (response === "Yes") {
          infoScene.registry.events.emit("switchscene", "BankScene", "BankScene", { level: 1 });
        }
      }
    ]
  },

  // Items

  bill: {
    texture: "bill"
  },
  chest: {
    texture: "dungeonTileset",
    frame: TILE_MAPPING.CHEST.CLOSED[0].index,
    openFrame: TILE_MAPPING.CHEST.OPEN[0].index
  },
  gun: {
    texture: "rpgChars",
    frame: ROGUELIKE_CHARACTERS.SWORD.DIAMOND,
    lines: "You have obtained the legendary diamond sword! Upon further inspection, you discover it is actually a gun. Press space to fire."
  },
  runningShoes: {
    texture: "rpgChars",
    frame: ROGUELIKE_CHARACTERS.BOOTS.BLUE,
    lines: "You have obtained the mythical running shoes! Hold shift to go faster."
  }
};