# Quick Backend Deployment Guide - Railway.app

## Why Railway?
- Free tier available
- Automatic deployments from GitHub
- Built-in environment management
- Easy WebSocket support
- No credit card required for trial

## Step-by-Step Deployment (5 minutes)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### Step 2: Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Select repository: `MikloshXXX/bang-game`
3. Click "Deploy Now"

### Step 3: Configure the Service
1. Railway will detect the repository
2. Go to "Settings" tab
3. Set **Root Directory**: `bang-game-backend`
4. Set **Start Command**: `pnpm install && pnpm start`
5. Click "Save Changes"

### Step 4: Configure Environment
1. Go to "Variables" tab
2. Add variable:
   - Name: `PORT`
   - Value: `3001`
3. Railway will auto-assign a public URL

### Step 5: Get Your Backend URL
1. Go to "Settings" tab
2. Under "Networking", click "Generate Domain"
3. Copy the generated URL (e.g., `bang-backend-production.up.railway.app`)
4. Your backend URL will be: `https://[your-domain].railway.app`

### Step 6: Update Frontend
1. Update frontend environment variable
2. Rebuild and redeploy frontend

---

## Alternative: Render.com Deployment

### Quick Steps:
1. Go to https://render.com
2. "New +" → "Web Service"
3. Connect GitHub repository: `MikloshXXX/bang-game`
4. Configure:
   - **Name**: bang-game-backend
   - **Root Directory**: bang-game-backend
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`
5. Click "Create Web Service"
6. Copy the provided URL

---

## Alternative: Docker Deployment

If you have Docker installed:

```bash
cd bang-game-backend
docker build -t bang-backend .
docker run -p 3001:3001 bang-backend
```

Or use docker-compose:

```bash
cd bang-game-backend
docker-compose up -d
```

---

## Verifying Deployment

Test your backend:
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "BANG! Game Server is running"
}
```

---

## Connecting Frontend to Backend

After backend is deployed:

1. Note your backend URL (e.g., `https://bang-backend.railway.app`)
2. Update frontend `.env.production`:
   ```
   VITE_SOCKET_URL=https://bang-backend.railway.app
   ```
3. Rebuild frontend:
   ```bash
   cd bang-game-frontend
   pnpm build
   ```
4. Redeploy the `dist` folder

---

## Testing the Complete Application

1. Open frontend URL: https://gcaizvig46ls.space.minimax.io
2. Check connection status (should show "Connected to server")
3. Create a room
4. Open in another browser/tab
5. Join the room with the room ID
6. Test multiplayer functionality

---

## Troubleshooting

### Backend Won't Start
- Check build logs in Railway/Render dashboard
- Verify `bang-game-backend` is set as root directory
- Ensure pnpm is being used

### Frontend Can't Connect
- Verify backend URL is correct in `.env.production`
- Check browser console for WebSocket errors
- Ensure backend health endpoint responds

### WebSocket Connection Issues
- Verify CORS is enabled (already configured)
- Check firewall settings
- Ensure using `wss://` for HTTPS backends

---

## Cost Estimate

**Railway Free Tier**:
- $5 free credit per month
- Enough for ~500 hours of runtime
- Perfect for testing and small groups

**Render Free Tier**:
- Free plan available
- Spins down after 15 minutes of inactivity
- Spins up automatically when accessed

---

## Need Help?

1. Check Railway/Render deployment logs
2. Visit GitHub issues
3. Verify all environment variables are set
4. Test backend health endpoint first

**Backend Repository**: https://github.com/MikloshXXX/bang-game/tree/main/bang-game-backend
