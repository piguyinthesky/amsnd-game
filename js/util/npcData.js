export const NPC_DATA = {
  librarian: {
    TEXTURE: "rpgChars",
    FRAME: 271,
    LINES: [
      infoScene => {
        if (infoScene.registry.get("name")) {
          if (infoScene.registry.get("inventory").includes("diamondSword"))
            return "My gosh my golly, you actually did go and get it! Congrats, you just got 1000 points!";
          else
            return "What are you waiting for? If you keep loitering, I'm going to start charing fees..."
        } else
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
                "But before I tell you anything, where's that book you borrowed 100 years ago? I'll still be waiting here!"
              ];
            }
          ];
      }
    ]
  },
  police: {},
  locked: {
    LINES: "These doors are closed!"
  },
  bank: {
    LINES: [
      {
        text: "Enter the bank?",
        options: [
          "Yes",
          "No"
        ]
      },
      (infoScene, response) => infoScene.registry.events.emit("switchscene", "MainScene", "BankScene")
    ]
  }
};