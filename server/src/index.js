import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import env from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Dynamic CORS configuration (supports comma-separated URLs, Vercel deployments, and localhost)
const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      allowedOrigins.includes('*') ||
      env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }
    // Allow any Vercel deployment preview or production domain (*.vercel.app)
    try {
      const parsed = new URL(normalizedOrigin);
      if (parsed.hostname.endsWith('.vercel.app') || parsed.hostname === 'vercel.app') {
        return callback(null, true);
      }
    } catch {
      // Ignore URL parse error
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoints for deployment platforms (Render, Railway, AWS, etc.)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
// 1. Primary versioned API routes
app.use('/api/v1', routes);

// 2. Compatibility mounts: supports requests sent to /api/... or directly to /auth, /inquiries, /settings
// so clients hitting the backend without /api/v1 prefix still resolve seamlessly
app.use('/api', routes);
app.use('/', routes);

// Serve client static build if available (for unified monorepo deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/auth') ||
      req.originalUrl.startsWith('/inquiries') ||
      req.originalUrl.startsWith('/settings') ||
      req.originalUrl.startsWith('/health')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root endpoint for standalone backend deployment (e.g. on Render, Railway)
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'DY&C API Server is running successfully',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        apiHealth: '/api/v1/health',
        auth: '/api/v1/auth',
        inquiries: '/api/v1/inquiries',
        settings: '/api/v1/settings',
      },
    });
  });
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process. Please free port ${PORT} or stop the existing server.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

