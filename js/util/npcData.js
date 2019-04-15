export const NPC_DATA = {
  librarian: {
    TEXTURE: "rpgChars",
    FRAME: 271,
    LINES: [
      (infoScene) => {
        if (infoScene.registry.get("inventory").includes("diamondSword"))
          return "My gosh my golly, you actually did go and get it!";
        else
          return [
            "How do you do? I'm the librarian, I'll be here to help out.",
            "But before I tell you anything, where's that book you borrowed 100 years ago? I'll still be waiting here!"
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
      "Enter the bank?",
      infoScene => infoScene.registry.events.emit("switchscene", "MainScene", "BankScene")
    ]
  }
};