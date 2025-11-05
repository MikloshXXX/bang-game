// Role definitions and distribution

const Roles = {
  SHERIFF: {
    name: 'Sheriff',
    description: 'Kill all Outlaws and the Renegade',
    revealed: true,
    bonusLife: 1
  },
  DEPUTY: {
    name: 'Deputy',
    description: 'Protect the Sheriff and kill all Outlaws and the Renegade',
    revealed: false,
    bonusLife: 0
  },
  OUTLAW: {
    name: 'Outlaw',
    description: 'Kill the Sheriff',
    revealed: false,
    bonusLife: 0
  },
  RENEGADE: {
    name: 'Renegade',
    description: 'Be the last player alive',
    revealed: false,
    bonusLife: 0
  }
};

// Role distribution based on player count
const getRoleDistribution = (playerCount) => {
  const distributions = {
    4: [Roles.SHERIFF, Roles.OUTLAW, Roles.OUTLAW, Roles.RENEGADE],
    5: [Roles.SHERIFF, Roles.DEPUTY, Roles.OUTLAW, Roles.OUTLAW, Roles.RENEGADE],
    6: [Roles.SHERIFF, Roles.DEPUTY, Roles.OUTLAW, Roles.OUTLAW, Roles.OUTLAW, Roles.RENEGADE],
    7: [Roles.SHERIFF, Roles.DEPUTY, Roles.DEPUTY, Roles.OUTLAW, Roles.OUTLAW, Roles.OUTLAW, Roles.RENEGADE]
  };

  if (!distributions[playerCount]) {
    throw new Error(`Invalid player count: ${playerCount}. Must be 4-7 players.`);
  }

  // Shuffle roles
  const roles = [...distributions[playerCount]];
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
};

const checkVictoryCondition = (players) => {
  const alivePlayers = players.filter(p => p.life > 0);
  const sheriff = alivePlayers.find(p => p.role.name === Roles.SHERIFF.name);
  const outlaws = alivePlayers.filter(p => p.role.name === Roles.OUTLAW.name);
  const renegade = alivePlayers.find(p => p.role.name === Roles.RENEGADE.name);

  // Sheriff is dead
  if (!sheriff) {
    // Only renegade alive = Renegade wins
    if (alivePlayers.length === 1 && renegade) {
      return { winner: Roles.RENEGADE.name, message: 'Renegade wins!' };
    }
    // At least one outlaw alive = Outlaws win
    if (outlaws.length > 0) {
      return { winner: Roles.OUTLAW.name, message: 'Outlaws win!' };
    }
  }

  // Sheriff alive, no outlaws or renegade = Sheriff and Deputies win
  if (sheriff && outlaws.length === 0 && !renegade) {
    return { winner: `${Roles.SHERIFF.name} and ${Roles.DEPUTY.name}`, message: 'Sheriff and Deputies win!' };
  }

  return null; // Game continues
};

module.exports = {
  Roles,
  getRoleDistribution,
  checkVictoryCondition
};
