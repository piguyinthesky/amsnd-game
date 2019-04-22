export default function initRegistry(registry) {
  registry.set({
    infoInitialized: true,
    
    money: 0,
    lives: 3,
    hp: 1000,
    inventory: [],
    
    mute: false,
    volume: 0.5,
    
    talkSpeed: 50,
  });
}