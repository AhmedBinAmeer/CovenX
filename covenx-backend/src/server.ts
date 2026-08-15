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
import { TemplateModel } from './models/Template.model.js';
import { ClauseModel } from './models/Clause.model.js';

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
    data: { status: 'OK', system: 'CovenX Enterprise CLM', timestamp: new Date().toISOString() },
    error: null,
  };
  res.status(200).json(response);
});

// API Routes
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Real-time Collaboration & Socket.IO Event Handlers
const activeLocks: Record<string, { userId: string; userName: string; lockedAt: Date }> = {};

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Room Join
  socket.on('join-contract', (contractId: string) => {
    socket.join(`contract:${contractId}`);
    console.log(`[Socket.IO] ${socket.id} joined room contract:${contractId}`);
  });

  // Section / Lock Management
  socket.on('acquire-lock', ({ contractId, userId, userName }) => {
    if (activeLocks[contractId] && activeLocks[contractId].userId !== userId) {
      socket.emit('lock-failed', { lockedBy: activeLocks[contractId].userName });
    } else {
      activeLocks[contractId] = { userId, userName, lockedAt: new Date() };
      io.to(`contract:${contractId}`).emit('lock-acquired', { userId, userName });
    }
  });

  socket.on('release-lock', ({ contractId }) => {
    delete activeLocks[contractId];
    io.to(`contract:${contractId}`).emit('lock-released', { contractId });
  });

  // Collaborative Typing Broadcast
  socket.on('edit-content', ({ contractId, content, updatedBy }) => {
    socket.to(`contract:${contractId}`).emit('content-updated', { content, updatedBy });
  });

  // Real-time Approval Notification Broadcast
  socket.on('approval-updated', ({ contractId, status, step }) => {
    io.emit('notification', {
      title: 'Approval Status Updated',
      message: `Contract ${contractId} step ${step} status changed to ${status}`,
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Seed Initial Data Helper
const seedDefaultData = async () => {
  try {
    const templateCount = await TemplateModel.countDocuments();
    if (templateCount === 0) {
      await TemplateModel.create([
        {
          name: 'Standard Master Services Agreement (MSA)',
          category: 'Enterprise',
          description: 'Standard enterprise service terms, SLA parameters, and general provisions.',
          content: 'MASTER SERVICES AGREEMENT\n\nThis Master Services Agreement ("Agreement") is entered into by and between {{PARTY_A}} and {{PARTY_B}}...\n\n1. SCOPE OF SERVICES\nProvider shall perform enterprise software implementation and SLA monitoring as outlined in Statement of Work...\n\n2. INDEMNIFICATION & LIABILITY\nEach party shall indemnify and hold harmless the other party against third-party claims up to the total contract value of ${{CONTRACT_VALUE}}.',
          placeholders: ['PARTY_A', 'PARTY_B', 'CONTRACT_VALUE'],
        },
        {
          name: 'Non-Disclosure Agreement (Mutual NDA)',
          category: 'Legal & IP',
          description: 'Mutual non-disclosure agreement for confidential technology reviews.',
          content: 'MUTUAL NON-DISCLOSURE AGREEMENT\n\n1. CONFIDENTIAL INFORMATION\nBoth {{PARTY_A}} and {{PARTY_B}} agree to maintain strict confidentiality regarding proprietary architectures, source code, and enterprise data...\n\n2. TERM & EXCLUSIONS\nThis confidentiality obligation shall remain effective for a period of 3 years from Effective Date.',
          placeholders: ['PARTY_A', 'PARTY_B'],
        },
      ]);
      console.log('[Seed] Default Templates Created');
    }

    const clauseCount = await ClauseModel.countDocuments();
    if (clauseCount === 0) {
      await ClauseModel.create([
        {
          title: 'Standard Enterprise Indemnity',
          category: 'Indemnification',
          body: 'Each party shall defend, indemnify, and hold harmless the other party and its officers, directors, and employees from and against any third-party claims, damages, or liabilities arising out of gross negligence or willful misconduct.',
          isMandatory: true,
          riskRating: 'LOW',
        },
        {
          title: 'Limitation of Liability Cap',
          category: 'Liability',
          body: 'EXCEPT FOR BREACHES OF CONFIDENTIALITY OR INDEMNIFICATION OBLIGATIONS, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. TOTAL AGGREGATE LIABILITY SHALL BE CAPPED AT 1X CONTRACT VALUE.',
          isMandatory: true,
          riskRating: 'MEDIUM',
        },
        {
          title: 'SLA Guarantee 99.99%',
          category: 'Service Level Agreement',
          body: 'Provider guarantees 99.99% monthly system uptime. If service availability drops below 99.99%, Client shall be entitled to a service credit equal to 5% of monthly fees for each 0.1% downtime.',
          isMandatory: false,
          riskRating: 'LOW',
        },
      ]);
      console.log('[Seed] Default Clauses Created');
    }
  } catch (err) {
    console.warn('[Seed Error] Non-fatal seed error:', err);
  }
};

// Boot Server
const startServer = async () => {
  await connectDB();
  await initRedis();
  await seedDefaultData();

  server.listen(config.port, () => {
    console.log(`[CovenX Backend] Platform API running on port ${config.port}`);
  });
};

startServer().catch((err) => {
  console.error('[CovenX Fatal Error]', err);
  process.exit(1);
});

export { app, server, io };
