# BANG! Game Deployment Guide

## Architecture Overview

The BANG! game consists of two components:
1. **Frontend** (React) - Deployed at: https://gcaizvig46ls.space.minimax.io
2. **Backend** (Node.js + Socket.io) - Needs separate deployment

## Backend Deployment Options

### Option 1: Railway (Recommended)

1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub:
   ```
   Repository: https://github.com/MikloshXXX/bang-game.git
   Root Directory: bang-game-backend
   Build Command: pnpm install
   Start Command: pnpm start
   ```
4. Set environment variables:
   ```
   PORT=3001 (or use Railway's default)
   ```
5. Note the deployed URL (e.g., `https://bang-game-backend.railway.app`)

### Option 2: Render

1. Create account at [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository: `https://github.com/MikloshXXX/bang-game.git`
4. Configure:
   ```
   Root Directory: bang-game-backend
   Build Command: pnpm install
   Start Command: pnpm start
   ```
5. Note the deployed URL

### Option 3: Heroku

1. Install Heroku CLI
2. From `bang-game-backend` directory:
   ```bash
   heroku create bang-game-backend
   git subtree push --prefix bang-game-backend heroku main
   ```

### Option 4: Local Server (Testing Only)

For local testing:
```bash
cd bang-game-backend
pnpm install
pnpm start
# Server runs at http://localhost:3001
```

## Connecting Frontend to Backend

After deploying the backend, update the frontend environment:

1. Edit `bang-game-frontend/.env.production`:
   ```
   VITE_SOCKET_URL=https://your-backend-url.com
   ```

2. Rebuild and redeploy frontend:
   ```bash
   cd bang-game-frontend
   pnpm build
   ```

3. Deploy the updated `dist` folder

## Testing the Deployment

1. Open the frontend URL: https://gcaizvig46ls.space.minimax.io
2. Enter your name
3. Create a room
4. Share room ID with friends
5. Wait for 4-7 players to join
6. Host clicks "Start Game"
7. Play BANG!

## Required Ports

- Backend: Port 3001 (or configured PORT)
- Frontend: Served via static hosting (any CDN)

## WebSocket Configuration

The backend uses Socket.io with CORS enabled for all origins. In production, you may want to restrict CORS to your frontend domain only.

Edit `bang-game-backend/src/server.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: 'https://gcaizvig46ls.space.minimax.io', // Your frontend URL
    methods: ['GET', 'POST']
  }
});
```

## Environment Variables Summary

### Backend
- `PORT` - Server port (default: 3001)

### Frontend
- `VITE_SOCKET_URL` - Backend WebSocket URL

## Monitoring

Check backend health:
```
GET https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "BANG! Game Server is running"
}
```

## Troubleshooting

### Frontend can't connect to backend
- Check CORS configuration
- Verify VITE_SOCKET_URL is correct
- Ensure backend is running and accessible
- Check browser console for errors

### Players can't join room
- Verify all players are connected to same backend
- Check room ID is correct
- Ensure backend WebSocket is working

### Game state not syncing
- Check WebSocket connection status
- Verify no firewall blocking WebSocket
- Check backend logs for errors

## Production Recommendations

1. **SSL/TLS**: Use HTTPS for both frontend and backend
2. **Environment Separation**: Separate production/staging environments
3. **Logging**: Implement proper logging (Winston, Pino)
4. **Error Tracking**: Use Sentry or similar
5. **Database**: Consider adding database for persistent state
6. **Scaling**: Use Redis for multi-instance Socket.io
7. **Rate Limiting**: Implement rate limiting on backend
8. **Authentication**: Add user authentication if needed

## Support

For issues:
- GitHub: https://github.com/MikloshXXX/bang-game/issues
- Check server logs
- Test locally first

## Quick Start (Full Stack Local)

Terminal 1 - Backend:
```bash
cd bang-game-backend
pnpm install
pnpm start
```

Terminal 2 - Frontend:
```bash
cd bang-game-frontend
pnpm install
pnpm dev
```

Open: http://localhost:5173
