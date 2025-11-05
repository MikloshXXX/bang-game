// Socket.io event handlers

const gameService = require('../services/gameService');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Create room
    socket.on('createRoom', ({ roomId, playerName }, callback) => {
      try {
        const room = gameService.createRoom(roomId, socket.id, playerName);
        socket.join(roomId);
        callback({ success: true, room });
        io.to(roomId).emit('roomUpdated', room);
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Join room
    socket.on('joinRoom', ({ roomId, playerName }, callback) => {
      try {
        const room = gameService.joinRoom(roomId, socket.id, playerName);
        socket.join(roomId);
        callback({ success: true, room });
        io.to(roomId).emit('roomUpdated', room);
        io.to(roomId).emit('playerJoined', { playerId: socket.id, playerName });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Leave room
    socket.on('leaveRoom', ({ roomId }) => {
      const room = gameService.leaveRoom(roomId, socket.id);
      socket.leave(roomId);
      if (room) {
        io.to(roomId).emit('roomUpdated', room);
        io.to(roomId).emit('playerLeft', { playerId: socket.id });
      }
    });

    // Toggle ready
    socket.on('toggleReady', ({ roomId }, callback) => {
      try {
        const room = gameService.toggleReady(roomId, socket.id);
        callback({ success: true });
        io.to(roomId).emit('roomUpdated', room);
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Start game
    socket.on('startGame', ({ roomId }, callback) => {
      try {
        const room = gameService.startGame(roomId, socket.id);
        callback({ success: true });
        io.to(roomId).emit('gameStarted', room.gameState);
        io.to(roomId).emit('roomUpdated', room);
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Draw cards
    socket.on('drawCards', ({ roomId, count }, callback) => {
      try {
        const { room, drawnCards } = gameService.drawCards(roomId, socket.id, count);
        callback({ success: true, drawnCards });
        io.to(roomId).emit('gameStateUpdated', room.gameState);
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Play card
    socket.on('playCard', ({ roomId, cardId, targetPlayerId }, callback) => {
      try {
        const room = gameService.playCard(roomId, socket.id, cardId, targetPlayerId);
        callback({ success: true });
        io.to(roomId).emit('gameStateUpdated', room.gameState);
        
        // If awaiting response, notify target player
        if (room.gameState.awaitingResponse) {
          io.to(room.gameState.awaitingResponse.target).emit('responseRequired', room.gameState.awaitingResponse);
        }
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Respond to BANG
    socket.on('respondToBang', ({ roomId, missedCardIds }, callback) => {
      try {
        const room = gameService.respondToBang(roomId, socket.id, missedCardIds);
        callback({ success: true });
        io.to(roomId).emit('gameStateUpdated', room.gameState);
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Respond to Duel
    socket.on('respondToDuel', ({ roomId, bangCardId }, callback) => {
      try {
        const room = gameService.respondToDuel(roomId, socket.id, bangCardId);
        callback({ success: true });
        io.to(roomId).emit('gameStateUpdated', room.gameState);
        
        // If still awaiting response, notify next player
        if (room.gameState.awaitingResponse) {
          io.to(room.gameState.awaitingResponse.currentResponder).emit('responseRequired', room.gameState.awaitingResponse);
        }
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // End turn
    socket.on('endTurn', ({ roomId }, callback) => {
      try {
        const room = gameService.endTurn(roomId, socket.id);
        callback({ success: true });
        io.to(roomId).emit('gameStateUpdated', room.gameState);
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Get room info
    socket.on('getRoomInfo', ({ roomId }, callback) => {
      try {
        const room = gameService.getRoom(roomId);
        if (!room) {
          callback({ success: false, error: 'Room not found' });
        } else {
          callback({ success: true, room });
        }
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Get rooms list
    socket.on('getRoomsList', (callback) => {
      try {
        const rooms = gameService.getRoomsList();
        callback({ success: true, rooms });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Remove player from all rooms
      const rooms = gameService.getRoomsList();
      rooms.forEach(roomInfo => {
        const room = gameService.getRoom(roomInfo.id);
        if (room && room.players.find(p => p.id === socket.id)) {
          const updatedRoom = gameService.leaveRoom(roomInfo.id, socket.id);
          if (updatedRoom) {
            io.to(roomInfo.id).emit('roomUpdated', updatedRoom);
            io.to(roomInfo.id).emit('playerLeft', { playerId: socket.id });
          }
        }
      });
    });
  });
};

module.exports = handleSocketConnection;
