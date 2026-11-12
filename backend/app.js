import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import env from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import { checkMaintenance } from './middleware/maintenance.js';
import { logRequest } from './utils/logger.js'; // Added Logger

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import innovationRoutes from './routes/innovation.routes.js';
import reportRoutes from './routes/report.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import settingRoutes from './routes/setting.routes.js';
import seoRoutes from './routes/seo.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Request Logger (Must be at the top to capture everything)
app.use(logRequest);

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));

// Webhooks need raw body
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Maintenance Mode (Only checks API routes)
app.use(checkMaintenance);

// API Routes
app.get('/api/health', (req, res) => res.json({ success: true, message: 'OpenTech API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/innovations', innovationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingRoutes);

// SEO Routes (Server-rendered Meta)
app.use('/', seoRoutes);

// Static Frontend
const FRONTEND = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND, { extensions: ['html'] }));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.method !== 'GET') return next();
  res.status(404).sendFile(path.join(FRONTEND, '404.html'));
});

app.use('/api', notFound);
app.use(errorHandler);

export default app;
