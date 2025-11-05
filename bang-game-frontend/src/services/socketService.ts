import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Connected to game server');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from game server');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Room management
  createRoom(roomId: string, playerName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('createRoom', { roomId, playerName }, (response: any) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('joinRoom', { roomId, playerName }, (response: any) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId });
    }
  }

  toggleReady(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('toggleReady', { roomId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  startGame(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('startGame', { roomId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Game actions
  drawCards(roomId: string, count: number = 2): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('drawCards', { roomId, count }, (response: any) => {
        if (response.success) {
          resolve(response.drawnCards);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  playCard(roomId: string, cardId: string, targetPlayerId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('playCard', { roomId, cardId, targetPlayerId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  respondToBang(roomId: string, missedCardIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('respondToBang', { roomId, missedCardIds }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  endTurn(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('endTurn', { roomId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  getRoomInfo(roomId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('getRoomInfo', { roomId }, (response: any) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  getRoomsList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('getRoomsList', (response: any) => {
        if (response.success) {
          resolve(response.rooms);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Event listeners
  onRoomUpdated(callback: (room: any) => void) {
    if (this.socket) {
      this.socket.on('roomUpdated', callback);
    }
  }

  onGameStarted(callback: (gameState: any) => void) {
    if (this.socket) {
      this.socket.on('gameStarted', callback);
    }
  }

  onGameStateUpdated(callback: (gameState: any) => void) {
    if (this.socket) {
      this.socket.on('gameStateUpdated', callback);
    }
  }

  onResponseRequired(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('responseRequired', callback);
    }
  }

  onPlayerJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('playerJoined', callback);
    }
  }

  onPlayerLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('playerLeft', callback);
    }
  }

  offRoomUpdated() {
    if (this.socket) {
      this.socket.off('roomUpdated');
    }
  }

  offGameStarted() {
    if (this.socket) {
      this.socket.off('gameStarted');
    }
  }

  offGameStateUpdated() {
    if (this.socket) {
      this.socket.off('gameStateUpdated');
    }
  }

  offResponseRequired() {
    if (this.socket) {
      this.socket.off('responseRequired');
    }
  }

  offPlayerJoined() {
    if (this.socket) {
      this.socket.off('playerJoined');
    }
  }

  offPlayerLeft() {
    if (this.socket) {
      this.socket.off('playerLeft');
    }
  }
}

export default new SocketService();
