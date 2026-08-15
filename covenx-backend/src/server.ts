import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ApiResponse } from './types/index.js';

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: { status: 'OK', timestamp: new Date().toISOString() },
    error: null,
  };
  res.status(200).json(response);
});

// API Routes
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

// WebSocket Connections
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join-contract', (contractId: string) => {
    socket.join(`contract:${contractId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined room contract:${contractId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Boot Server
const startServer = async () => {
  await connectDB();
  await initRedis();

  server.listen(config.port, () => {
    console.log(`[CovenX Backend] Running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

startServer().catch((err) => {
  console.error('[CovenX Fatal Error]', err);
  process.exit(1);
});

export { app, server, io };
