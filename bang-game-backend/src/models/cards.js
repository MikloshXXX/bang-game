// Card types and definitions for BANG! game

const CardTypes = {
  BANG: 'BANG!',
  MISSED: 'Missed!',
  BEER: 'Beer',
  SALOON: 'Saloon',
  STAGECOACH: 'Stagecoach',
  WELLS_FARGO: 'Wells Fargo',
  DILIGENZA: 'Diligenza',
  GENERAL_STORE: 'General Store',
  PANIC: 'Panic!',
  CAT_BALOU: 'Cat Balou',
  DUEL: 'Duel',
  INDIANS: 'Indians!',
  GATLING: 'Gatling',
  BARREL: 'Barrel',
  DYNAMITE: 'Dynamite',
  JAIL: 'Jail',
  SCOPE: 'Scope',
  MUSTANG: 'Mustang',
  APPALOOSA: 'Appaloosa',
  VOLCANIC: 'Volcanic',
  SCHOFIELD: 'Schofield',
  REMINGTON: 'Remington',
  REV_CARABINE: 'Rev. Carabine',
  WINCHESTER: 'Winchester'
};

const CardCategories = {
  OFFENSIVE: 'offensive',
  DEFENSIVE: 'defensive',
  DRAW: 'draw',
  EQUIPMENT: 'equipment',
  WEAPON: 'weapon'
};

// Full deck definition
const createDeck = () => {
  const deck = [
    // BANG! cards (25)
    ...Array(25).fill({ type: CardTypes.BANG, category: CardCategories.OFFENSIVE, description: 'Shoot another player' }),
    
    // Missed! cards (12)
    ...Array(12).fill({ type: CardTypes.MISSED, category: CardCategories.DEFENSIVE, description: 'Defend against a BANG!' }),
    
    // Beer cards (6)
    ...Array(6).fill({ type: CardTypes.BEER, category: CardCategories.DEFENSIVE, description: 'Recover 1 life point' }),
    
    // Saloon (1)
    { type: CardTypes.SALOON, category: CardCategories.DEFENSIVE, description: 'All players recover 1 life point' },
    
    // Stagecoach (2)
    ...Array(2).fill({ type: CardTypes.STAGECOACH, category: CardCategories.DRAW, description: 'Draw 2 cards' }),
    
    // Wells Fargo (1)
    { type: CardTypes.WELLS_FARGO, category: CardCategories.DRAW, description: 'Draw 3 cards' },
    
    // General Store (2)
    ...Array(2).fill({ type: CardTypes.GENERAL_STORE, category: CardCategories.DRAW, description: 'All players draw 1 card' }),
    
    // Panic! (4)
    ...Array(4).fill({ type: CardTypes.PANIC, category: CardCategories.OFFENSIVE, description: 'Draw a card from another player at distance 1' }),
    
    // Cat Balou (4)
    ...Array(4).fill({ type: CardTypes.CAT_BALOU, category: CardCategories.OFFENSIVE, description: 'Discard a card from any player' }),
    
    // Duel (3)
    ...Array(3).fill({ type: CardTypes.DUEL, category: CardCategories.OFFENSIVE, description: 'Challenge another player to a duel' }),
    
    // Indians! (2)
    ...Array(2).fill({ type: CardTypes.INDIANS, category: CardCategories.OFFENSIVE, description: 'All other players must discard a BANG! or lose 1 life' }),
    
    // Gatling (1)
    { type: CardTypes.GATLING, category: CardCategories.OFFENSIVE, description: 'All other players must discard a Missed! or lose 1 life' },
    
    // Barrel (2)
    ...Array(2).fill({ type: CardTypes.BARREL, category: CardCategories.EQUIPMENT, description: 'May draw to dodge a BANG!' }),
    
    // Dynamite (1)
    { type: CardTypes.DYNAMITE, category: CardCategories.EQUIPMENT, description: 'At turn start, may explode and deal 3 damage' },
    
    // Jail (3)
    ...Array(3).fill({ type: CardTypes.JAIL, category: CardCategories.EQUIPMENT, description: 'Skip turn unless you draw hearts' }),
    
    // Scope (1)
    { type: CardTypes.SCOPE, category: CardCategories.EQUIPMENT, description: 'See all other players at distance -1' },
    
    // Mustang (2)
    ...Array(2).fill({ type: CardTypes.MUSTANG, category: CardCategories.EQUIPMENT, description: 'Others see you at distance +1' }),
    
    // Weapons
    { type: CardTypes.VOLCANIC, category: CardCategories.WEAPON, range: 1, description: 'Unlimited BANG! per turn', unlimited: true },
    { type: CardTypes.SCHOFIELD, category: CardCategories.WEAPON, range: 2, description: 'Range 2' },
    { type: CardTypes.REMINGTON, category: CardCategories.WEAPON, range: 3, description: 'Range 3' },
    { type: CardTypes.REV_CARABINE, category: CardCategories.WEAPON, range: 4, description: 'Range 4' },
    { type: CardTypes.WINCHESTER, category: CardCategories.WEAPON, range: 5, description: 'Range 5' }
  ];

  // Add IDs and shuffle
  return deck.map((card, index) => ({
    ...card,
    id: `card-${index}-${Math.random().toString(36).substr(2, 9)}`
  }));
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = {
  CardTypes,
  CardCategories,
  createDeck,
  shuffleDeck
};
