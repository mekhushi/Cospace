import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { register, login } from './controllers/auth';
import { PlayerManager } from './socket/PlayerManager';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
});

process.on('unhandledRejection', (reason: any, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(reason?.name || 'Rejection', reason?.message || reason);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'CoSpace Server is running', timestamp: new Date() });
});

// Auth Routes
app.post('/api/register', register);
app.post('/api/login', login);

// Initialize Socket logic
const playerManager = new PlayerManager(io);
playerManager.start();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
