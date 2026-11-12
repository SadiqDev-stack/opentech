import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import env from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- API FIRST (never disturbed by static) ----------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OpenTech API is running',
    data: { time: new Date().toISOString(), env: env.nodeEnv }
  });
});

// Future API routes will mount here, e.g.:
// app.use('/api/auth', authRoutes);
// app.use('/api', indexRoutes);

// ---------- STATIC FRONTEND ----------
const FRONTEND = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND, { extensions: ['html'] }));

// Clean paths
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// Any unknown non-API GET goes to 404 page
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.method !== 'GET') return next();
  res.status(404).sendFile(path.join(FRONTEND, '404.html'));
});

// ---------- ERROR HANDLERS ----------
app.use('/api', notFound);
app.use(errorHandler);

export default app;
