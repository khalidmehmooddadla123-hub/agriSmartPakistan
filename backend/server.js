const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS — allow localhost (dev) + Vercel (prod) + explicit CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000'
].filter(Boolean);

// Allow any Vercel-hosted domain (covers preview deployments + main)
const vercelPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const localhostPattern = /^http:\/\/localhost:\d+$/;

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / server-to-server requests (no Origin header)
    if (!origin) return cb(null, true);
    // Allow all localhost in any mode
    if (localhostPattern.test(origin)) return cb(null, true);
    // Allow any Vercel deployment
    if (vercelPattern.test(origin)) return cb(null, true);
    // Allow explicit whitelist
    if (allowedOrigins.includes(origin)) return cb(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    cb(null, false);
  },
  credentials: true
}));

// Rate limiting — generous global cap to keep the app usable on shared IPs/networks.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window per IP
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth limiter — only brute-forceable endpoints (login, register, OTP, password reset).
// Excludes /me and /refresh-token which are routine and called on every refresh.
// `skipSuccessfulRequests: true` means legitimate logins do NOT consume the budget —
// only failed attempts count, which is what protects against brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many failed login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Apply auth limiter only to the routes that need brute-force protection
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger API Documentation
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AgriSmart360 API Docs'
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/news', require('./routes/news'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/export', require('./routes/export'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/outbreaks', require('./routes/outbreaks'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/soil-tests', require('./routes/soilTests'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/crop-loss', require('./routes/cropLoss'));
app.use('/api/crop-id', require('./routes/cropID'));
app.use('/api/subsidies', require('./routes/subsidies'));
app.use('/api/loan-providers', require('./routes/loanProviders'));
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Root — friendly welcome page
app.get('/', (req, res) => {
  res.json({
    name: 'AgriSmart360 API',
    status: 'live',
    version: '1.0.0',
    description: 'Smart Agriculture Management Platform for Pakistani Farmers',
    endpoints: {
      health: '/api/health',
      docs: '/api-docs',
      auth: '/api/auth/login',
      crops: '/api/crops',
      prices: '/api/prices/latest',
      weather: '/api/weather/:locationID',
      news: '/api/news'
    },
    author: 'Khalid Mehmood — FYP, IUB',
    frontend: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Start cron jobs
require('./services/cronJobs');

// Socket.io setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (process.env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Track connected users by their userId
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  // User joins their personal room after auth
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      connectedUsers.set(socket.id, userId);
      console.log(`[SOCKET] User ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    if (userId) console.log(`[SOCKET] User ${userId} disconnected`);
  });
});

// Make io accessible in routes/services
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Graceful startup — handle port-in-use gracefully instead of crashing
if (process.env.NODE_ENV !== 'test') {
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('\n╔════════════════════════════════════════════════════════════╗');
      console.error(`║  ⚠️  PORT ${PORT} IS ALREADY IN USE                            ║`);
      console.error('╠════════════════════════════════════════════════════════════╣');
      console.error('║  Another process is running on this port. Fix it by:      ║');
      console.error('║                                                            ║');
      console.error('║  Windows:  netstat -ano | findstr :5000                   ║');
      console.error('║            taskkill /PID <PID> /F                         ║');
      console.error('║                                                            ║');
      console.error('║  Or set a different port:                                 ║');
      console.error('║            PORT=5001 npm run dev                          ║');
      console.error('╚════════════════════════════════════════════════════════════╝\n');
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown on Ctrl+C / SIGTERM
  const shutdown = (signal) => {
    console.log(`\n[SERVER] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('[SERVER] HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[SERVER] Forcing shutdown (timeout)');
      process.exit(1);
    }, 5000);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Bind to 0.0.0.0 explicitly so cloud platforms (Render/Railway/Fly) can route traffic
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ AgriSmart360 API listening on 0.0.0.0:${PORT}`);
    console.log(`✓ Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API docs available at /api-docs\n`);
  });
}

module.exports = app;
