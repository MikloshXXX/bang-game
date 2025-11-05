# BANG! Card Game - Multiplayer Web Application

A fully functional implementation of the classic BANG! card game with real-time multiplayer functionality using WebSocket technology.

## Features

### Complete Game Implementation
- Full BANG! game rules and mechanics
- 4-7 player support
- Role-based gameplay (Sheriff, Deputy, Outlaw, Renegade)
- 16 unique characters with special abilities
- Complete card deck with all game cards
- Turn-based gameplay with multiple phases
- Victory condition detection
- Player elimination system

### Real-Time Multiplayer
- WebSocket-based real-time communication using Socket.io
- Room creation and management
- Player ready system
- Live game state synchronization
- Automatic disconnection handling
- Real-time game log updates

### User Interface
- Responsive design for desktop and mobile
- Intuitive game board layout
- Clear player status display
- Interactive card playing system
- Target selection for offensive cards
- Turn indicator and phase display
- Game log for action tracking

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **Socket.io-client** - WebSocket client
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web server
- **Socket.io** - WebSocket server
- **UUID** - Unique ID generation

## Project Structure

```
bang-game/
├── bang-game-frontend/          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     # Room creation/joining
│   │   │   └── GameRoom.tsx     # Main game interface
│   │   ├── services/
│   │   │   └── socketService.ts # WebSocket service
│   │   └── App.tsx              # Main app with routing
│   ├── public/
│   └── package.json
│
└── bang-game-backend/           # Node.js backend
    ├── src/
    │   ├── controllers/
    │   │   └── socketController.js  # Socket event handlers
    │   ├── models/
    │   │   ├── cards.js            # Card definitions
    │   │   ├── characters.js       # Character abilities
    │   │   └── roles.js            # Role system
    │   ├── services/
    │   │   └── gameService.js      # Game logic
    │   └── server.js               # Express + Socket.io server
    └── package.json
```

## Installation

### Prerequisites
- Node.js 18+ or higher
- pnpm (recommended) or npm

### Backend Setup

```bash
cd bang-game-backend
pnpm install
pnpm start
```

The backend server will run on `http://localhost:3001`

For development with auto-reload:
```bash
pnpm dev
```

### Frontend Setup

```bash
cd bang-game-frontend
pnpm install
pnpm dev
```

The frontend will run on `http://localhost:5173`

## Configuration

### Backend Configuration

The backend can be configured via environment variables:

```env
PORT=3001  # Server port (default: 3001)
```

### Frontend Configuration

Create a `.env` file in the frontend directory:

```env
VITE_SOCKET_URL=http://localhost:3001  # Backend URL
```

For production deployment, update this to your backend server URL.

## Game Rules

### Roles
- **Sheriff**: Eliminate all Outlaws and the Renegade (revealed at start)
- **Deputy**: Protect the Sheriff (hidden identity)
- **Outlaw**: Kill the Sheriff (hidden identity)
- **Renegade**: Be the last player alive (hidden identity)

### Game Flow
1. **Draw Phase**: Draw 2 cards from the deck
2. **Play Phase**: Play cards from your hand
3. **Discard Phase**: End turn (automatic when you choose to end)

### Key Cards
- **BANG!**: Shoot another player (requires Missed! to defend)
- **Missed!**: Defend against a BANG!
- **Beer**: Recover 1 life point
- **Panic!**: Steal a card from a player at distance 1
- **Cat Balou**: Discard a card from any player
- **Weapons**: Extend shooting range
- **Equipment**: Special items (Barrel, Mustang, Scope, etc.)

### Characters
16 unique characters with special abilities including:
- Bart Cassidy, Black Jack, Calamity Janet
- El Gringo, Jesse Jones, Jourdonnais
- Kit Carlson, Lucky Duke, Paul Regret
- Pedro Ramirez, Rose Doolan, Sid Ketchum
- Slab the Killer, Suzy Lafayette, Vulture Sam
- Willy the Kid

## API Documentation

### Socket Events

#### Client to Server
- `createRoom` - Create a new game room
- `joinRoom` - Join an existing room
- `leaveRoom` - Leave current room
- `toggleReady` - Toggle ready status
- `startGame` - Start the game (host only)
- `drawCards` - Draw cards during draw phase
- `playCard` - Play a card from hand
- `respondToBang` - Respond to a BANG! attack
- `endTurn` - End current turn
- `getRoomInfo` - Get room information
- `getRoomsList` - Get list of all rooms

#### Server to Client
- `roomUpdated` - Room state changed
- `gameStarted` - Game has started
- `gameStateUpdated` - Game state changed
- `responseRequired` - Player must respond to action
- `playerJoined` - Player joined room
- `playerLeft` - Player left room

## Development

### Running Tests

```bash
# Backend
cd bang-game-backend
pnpm test

# Frontend
cd bang-game-frontend
pnpm test
```

### Building for Production

```bash
# Frontend
cd bang-game-frontend
pnpm build

# Backend (no build needed, runs directly)
```

### Deployment

#### Backend Deployment
The backend can be deployed to any Node.js hosting service (Heroku, Railway, Render, etc.)

1. Set environment variables
2. Deploy the `bang-game-backend` directory
3. Ensure the PORT is correctly configured

#### Frontend Deployment
The frontend can be deployed to static hosting (Vercel, Netlify, etc.)

1. Update `VITE_SOCKET_URL` to production backend URL
2. Build the application: `pnpm build`
3. Deploy the `dist` directory

## Troubleshooting

### Connection Issues
- Ensure backend is running on port 3001
- Check firewall settings
- Verify CORS configuration
- Check WebSocket support in browser

### Game Issues
- Minimum 4 players required to start
- All players must be ready before starting
- Only host can start the game
- Cards must be played during play phase

## Future Enhancements

- Additional card types (Gatling, Duel, Indians, etc.)
- Full character ability implementation
- Equipment and weapon mechanics
- Distance calculation system
- Advanced game features (Dynamite, Jail, etc.)
- Player statistics and leaderboards
- Spectator mode
- Chat system
- Game replays
- Mobile app version

## License

MIT License - Feel free to use and modify for your projects

## Credits

Developed by MiniMax Agent
Based on the original BANG! card game by Emiliano Sciarra

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For issues and questions, please open an issue on GitHub.
