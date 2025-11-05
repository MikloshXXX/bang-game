// Character definitions with special abilities

const Characters = {
  BART_CASSIDY: {
    name: 'Bart Cassidy',
    life: 4,
    ability: 'Each time he loses a life point, he draws a card',
    abilityCode: 'DRAW_ON_DAMAGE'
  },
  BLACK_JACK: {
    name: 'Black Jack',
    life: 4,
    ability: 'During phase 1, he shows the second card he draws. On Hearts or Diamonds, he draws one more card',
    abilityCode: 'LUCKY_DRAW'
  },
  CALAMITY_JANET: {
    name: 'Calamity Janet',
    life: 4,
    ability: 'She can play BANG! cards as Missed! and vice versa',
    abilityCode: 'CARD_SWAP'
  },
  EL_GRINGO: {
    name: 'El Gringo',
    life: 3,
    ability: 'Each time he loses a life point due to a card played by another player, he draws a random card from that player',
    abilityCode: 'REVENGE_DRAW'
  },
  JESSE_JONES: {
    name: 'Jesse Jones',
    life: 4,
    ability: 'During phase 1, he may draw the first card from the deck or from a player',
    abilityCode: 'STEAL_DRAW'
  },
  JOURDONNAIS: {
    name: 'Jourdonnais',
    life: 4,
    ability: 'He is considered to have a Barrel in play at all times',
    abilityCode: 'PERMANENT_BARREL'
  },
  KIT_CARLSON: {
    name: 'Kit Carlson',
    life: 4,
    ability: 'During phase 1, he looks at the top three cards and draws 2, putting the other back',
    abilityCode: 'CARD_CHOICE'
  },
  LUCKY_DUKE: {
    name: 'Lucky Duke',
    life: 4,
    ability: 'Each time he "draws!", he flips the top two cards and chooses the result',
    abilityCode: 'LUCKY_FLIP'
  },
  PAUL_REGRET: {
    name: 'Paul Regret',
    life: 3,
    ability: 'He is considered to have a Mustang in play at all times',
    abilityCode: 'PERMANENT_MUSTANG'
  },
  PEDRO_RAMIREZ: {
    name: 'Pedro Ramirez',
    life: 4,
    ability: 'During phase 1, he may draw the first card from the top of the discard pile',
    abilityCode: 'DISCARD_DRAW'
  },
  ROSE_DOOLAN: {
    name: 'Rose Doolan',
    life: 4,
    ability: 'She is considered to have a Scope in play at all times',
    abilityCode: 'PERMANENT_SCOPE'
  },
  SID_KETCHUM: {
    name: 'Sid Ketchum',
    life: 4,
    ability: 'At any time, he may discard 2 cards to regain 1 life point',
    abilityCode: 'HEAL'
  },
  SLAB_THE_KILLER: {
    name: 'Slab the Killer',
    life: 4,
    ability: 'Players need 2 Missed! to cancel his BANG!',
    abilityCode: 'DOUBLE_MISSED'
  },
  SUZY_LAFAYETTE: {
    name: 'Suzy Lafayette',
    life: 4,
    ability: 'When she has no cards in hand, she draws a card',
    abilityCode: 'AUTO_DRAW'
  },
  VULTURE_SAM: {
    name: 'Vulture Sam',
    life: 4,
    ability: 'Whenever a player is eliminated, he takes all cards from that player',
    abilityCode: 'SCAVENGE'
  },
  WILLY_THE_KID: {
    name: 'Willy the Kid',
    life: 4,
    ability: 'He can play any number of BANG! cards',
    abilityCode: 'UNLIMITED_BANG'
  }
};

const getRandomCharacters = (count) => {
  const characterArray = Object.values(Characters);
  const shuffled = [...characterArray].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

module.exports = {
  Characters,
  getRandomCharacters
};
