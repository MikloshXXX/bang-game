// Game state management and logic

const { v4: uuidv4 } = require('uuid');
const { createDeck, shuffleDeck, CardTypes, CardCategories } = require('../models/cards');
const { getRandomCharacters } = require('../models/characters');
const { getRoleDistribution, checkVictoryCondition, Roles } = require('../models/roles');

class GameService {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, creatorId, creatorName) {
    if (this.rooms.has(roomId)) {
      throw new Error('Room already exists');
    }

    const room = {
      id: roomId,
      createdBy: creatorId,
      players: [{
        id: creatorId,
        name: creatorName,
        isReady: false,
        isHost: true
      }],
      gameState: null,
      status: 'waiting', // waiting, playing, finished
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game already started');
    }

    if (room.players.length >= 7) {
      throw new Error('Room is full');
    }

    if (room.players.find(p => p.id === playerId)) {
      throw new Error('Already in room');
    }

    room.players.push({
      id: playerId,
      name: playerName,
      isReady: false,
      isHost: false
    });

    return room;
  }

  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    room.players = room.players.filter(p => p.id !== playerId);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    // Assign new host if host left
    if (!room.players.find(p => p.isHost)) {
      room.players[0].isHost = true;
    }

    return room;
  }

  toggleReady(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not in room');
    }

    player.isReady = !player.isReady;
    return room;
  }

  startGame(roomId, hostId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const host = room.players.find(p => p.id === hostId);
    if (!host || !host.isHost) {
      throw new Error('Only host can start game');
    }

    if (room.players.length < 4) {
      throw new Error('Need at least 4 players to start');
    }

    if (!room.players.every(p => p.isReady || p.isHost)) {
      throw new Error('Not all players are ready');
    }

    // Initialize game state
    const deck = shuffleDeck(createDeck());
    const roles = getRoleDistribution(room.players.length);
    const characters = getRandomCharacters(room.players.length);

    const gamePlayers = room.players.map((player, index) => {
      const character = characters[index];
      const role = roles[index];
      const maxLife = character.life + (role.name === Roles.SHERIFF.name ? 1 : 0);

      // Deal initial cards (sheriff gets 1 extra)
      const initialCards = role.name === Roles.SHERIFF.name ? 
        deck.splice(0, maxLife + 1) : 
        deck.splice(0, maxLife);

      return {
        id: player.id,
        name: player.name,
        character: character,
        role: role,
        life: maxLife,
        maxLife: maxLife,
        hand: initialCards,
        equipment: [],
        weapon: null,
        bangPlayed: 0,
        isDead: false,
        position: index
      };
    });

    // Sheriff always goes first
    const sheriffIndex = gamePlayers.findIndex(p => p.role.name === Roles.SHERIFF.name);

    room.gameState = {
      deck: deck,
      discardPile: [],
      players: gamePlayers,
      currentPlayerIndex: sheriffIndex,
      currentPhase: 'draw', // draw, play, discard
      turnNumber: 1,
      gameLog: ['Game started! Sheriff takes the first turn.'],
      awaitingResponse: null // For handling cards that require response
    };

    room.status = 'playing';
    return room;
  }

  drawCards(roomId, playerId, count = 2) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      throw new Error('Game not found');
    }

    const gameState = room.gameState;
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (gameState.currentPlayerIndex !== player.position) {
      throw new Error('Not your turn');
    }

    if (gameState.currentPhase !== 'draw') {
      throw new Error('Not in draw phase');
    }

    // Draw cards from deck
    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      if (gameState.deck.length === 0) {
        // Reshuffle discard pile
        gameState.deck = shuffleDeck([...gameState.discardPile]);
        gameState.discardPile = [];
      }
      
      if (gameState.deck.length > 0) {
        const card = gameState.deck.shift();
        player.hand.push(card);
        drawnCards.push(card);
      }
    }

    gameState.currentPhase = 'play';
    gameState.gameLog.push(`${player.name} drew ${count} card(s)`);

    return { room, drawnCards };
  }

  playCard(roomId, playerId, cardId, targetPlayerId = null) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      throw new Error('Game not found');
    }

    const gameState = room.gameState;
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (gameState.currentPlayerIndex !== player.position) {
      throw new Error('Not your turn');
    }

    if (gameState.currentPhase !== 'play') {
      throw new Error('Not in play phase');
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not in hand');
    }

    const card = player.hand[cardIndex];
    let targetPlayer = null;

    if (targetPlayerId) {
      targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer) {
        throw new Error('Target player not found');
      }
    }

    // Process card based on type
    switch (card.type) {
      case CardTypes.BANG:
        if (player.bangPlayed >= 1 && player.character.abilityCode !== 'UNLIMITED_BANG' && 
            (!player.weapon || !player.weapon.unlimited)) {
          throw new Error('Already played BANG! this turn');
        }
        if (!targetPlayer) {
          throw new Error('Must target a player');
        }
        this.handleBang(gameState, player, targetPlayer, card);
        player.bangPlayed++;
        break;

      case CardTypes.BEER:
        if (player.life < player.maxLife) {
          player.life = Math.min(player.life + 1, player.maxLife);
          gameState.gameLog.push(`${player.name} recovered 1 life`);
        }
        break;

      case CardTypes.MISSED:
        throw new Error('Can only play Missed! in response to BANG!');

      case CardTypes.CAT_BALOU:
      case CardTypes.PANIC:
        if (!targetPlayer) {
          throw new Error('Must target a player');
        }
        this.handleDiscard(gameState, player, targetPlayer, card);
        break;

      default:
        // Handle other cards
        gameState.gameLog.push(`${player.name} played ${card.type}`);
        break;
    }

    // Remove card from hand and add to discard pile
    player.hand.splice(cardIndex, 1);
    gameState.discardPile.push(card);

    return room;
  }

  handleBang(gameState, attacker, target, card) {
    gameState.gameLog.push(`${attacker.name} plays BANG! on ${target.name}`);
    
    // Target must respond with Missed! or take damage
    gameState.awaitingResponse = {
      type: 'BANG',
      attacker: attacker.id,
      target: target.id,
      cardId: card.id,
      missedRequired: attacker.character.abilityCode === 'DOUBLE_MISSED' ? 2 : 1
    };
  }

  respondToBang(roomId, playerId, missedCardIds) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      throw new Error('Game not found');
    }

    const gameState = room.gameState;
    if (!gameState.awaitingResponse || gameState.awaitingResponse.type !== 'BANG') {
      throw new Error('Not awaiting BANG response');
    }

    const target = gameState.players.find(p => p.id === playerId);
    if (!target || target.id !== gameState.awaitingResponse.target) {
      throw new Error('Invalid response');
    }

    const missedRequired = gameState.awaitingResponse.missedRequired;

    // Check if player has enough Missed! cards
    if (missedCardIds.length < missedRequired) {
      // Take damage
      target.life--;
      gameState.gameLog.push(`${target.name} takes 1 damage (${target.life}/${target.maxLife} life remaining)`);
      
      if (target.life <= 0) {
        this.eliminatePlayer(gameState, target);
      }
    } else {
      // Play Missed! cards
      missedCardIds.forEach(missedId => {
        const cardIndex = target.hand.findIndex(c => c.id === missedId);
        if (cardIndex !== -1) {
          const card = target.hand.splice(cardIndex, 1)[0];
          gameState.discardPile.push(card);
        }
      });
      gameState.gameLog.push(`${target.name} plays Missed!`);
    }

    gameState.awaitingResponse = null;
    return room;
  }

  handleDiscard(gameState, player, target, card) {
    if (target.hand.length === 0 && target.equipment.length === 0) {
      throw new Error('Target has no cards');
    }

    // For simplicity, discard a random card
    let discardedCard;
    if (target.hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * target.hand.length);
      discardedCard = target.hand.splice(randomIndex, 1)[0];
    } else {
      const randomIndex = Math.floor(Math.random() * target.equipment.length);
      discardedCard = target.equipment.splice(randomIndex, 1)[0];
    }

    gameState.discardPile.push(discardedCard);
    gameState.gameLog.push(`${player.name} discarded a card from ${target.name}`);
  }

  eliminatePlayer(gameState, player) {
    player.isDead = true;
    player.hand = [];
    player.equipment = [];
    gameState.gameLog.push(`${player.name} is eliminated!`);

    // Check victory condition
    const victory = checkVictoryCondition(gameState.players);
    if (victory) {
      gameState.winner = victory;
      gameState.gameLog.push(victory.message);
    }
  }

  endTurn(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      throw new Error('Game not found');
    }

    const gameState = room.gameState;
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (gameState.currentPlayerIndex !== player.position) {
      throw new Error('Not your turn');
    }

    // Reset for next turn
    player.bangPlayed = 0;

    // Move to next alive player
    let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    while (gameState.players[nextIndex].isDead) {
      nextIndex = (nextIndex + 1) % gameState.players.length;
    }

    gameState.currentPlayerIndex = nextIndex;
    gameState.currentPhase = 'draw';
    gameState.turnNumber++;

    const nextPlayer = gameState.players[nextIndex];
    gameState.gameLog.push(`${nextPlayer.name}'s turn`);

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomsList() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      playerCount: room.players.length,
      status: room.status,
      createdAt: room.createdAt
    }));
  }
}

module.exports = new GameService();
