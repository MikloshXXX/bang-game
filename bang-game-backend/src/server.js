// Express and Socket.io server

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const handleSocketConnection = require('./controllers/socketController');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BANG! Game Server is running' });
});

// Initialize socket handlers
handleSocketConnection(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`BANG! Game Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
