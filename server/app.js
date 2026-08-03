import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { isDbConnected } from './config/db.js';
import { requireDb } from './middlewares/requireDb.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// Business-side routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import businessSettingsRoutes from './routes/businessSettingsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Admin-side routes
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminBusinessRoutes from './routes/adminBusinessRoutes.js';
import planRoutes from './routes/planRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import paymentWebhookRoutes from './routes/paymentWebhookRoutes.js';
import platformUserRoutes from './routes/platformUserRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import platformNotificationRoutes from './routes/platformNotificationRoutes.js';
import rolePermissionRoutes from './routes/rolePermissionRoutes.js';
import platformSettingsRoutes from './routes/platformSettingsRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';

const app = express();

// Deployment platforms (Render, Railway, Fly, Heroku, etc.) sit one reverse
// proxy in front of the app. Without this, every request's req.ip resolves to
// the proxy's IP — collapsing the auth rate limiter into one shared bucket for
// all users, and making audit-log IPs useless. Only trusted in production
// since local dev has no proxy in front of it.
if (env.nodeEnv === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
// Stashes the raw request bytes on req.rawBody as express.json parses — needed
// because webhook signature verification (Paystack) must hash the exact bytes
// sent, not a re-serialized copy of the parsed object.
app.use(express.json({ limit: '2mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Basic rate limiting on auth endpoints to slow down brute-force attempts
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter);
app.use('/api/admin/auth', authLimiter);

// Health check — always available, independent of DB connection state
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', db: isDbConnected() ? 'connected' : 'disconnected', env: env.nodeEnv });
});

// All /api routes require an active DB connection — fail fast with 503 rather than hanging
app.use('/api', requireDb);

// Business-side API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/business', businessSettingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Admin-side API
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/businesses', adminBusinessRoutes);
app.use('/api/admin/plans', planRoutes);
app.use('/api/admin/payments', paymentRoutes);
app.use('/api/webhooks', paymentWebhookRoutes);
app.use('/api/admin/users', platformUserRoutes);
app.use('/api/admin/tickets', ticketRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/admin/notifications', platformNotificationRoutes);
app.use('/api/admin/roles', rolePermissionRoutes);
app.use('/api/admin/settings', platformSettingsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
