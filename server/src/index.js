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


// Dynamic CORS configuration (supports comma-separated URLs and localhost)
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

// API Routes
app.use('/api/v1', routes);

// Serve client static build if available (for unified monorepo deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
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

