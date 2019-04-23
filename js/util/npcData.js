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

  // Characters

  hermia: {
    texture: "rpgChars",
    frame: 378
  },
  helena: {
    texture: "rpgChars",
    frame: 270
  },
  demetrius: {
    texture: "rpgChars",
    frame: 487
  },
  lysander: {
    texture: "rpgChars",
    frame: 324
  },

  theseus: {
    texture: "customChars",
    frame: 0
  },
  hippolyta: {
    texture: "customChars",
    frame: 1
  },

  egeus: {
    texture: "customChars",
    frame: 2
  },

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
  npcBlood: {
    texture: "rpgChars",
    frame: 594,
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
  car: {
    lines: "It's a locked car."
  },
  house: {
    lines: "The doors to your own house have been forced back into the frame. They do not open."
  },
  locked: {
    lines: "These doors are closed!"
  }
};