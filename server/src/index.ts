import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import { authRouter } from './routes/auth.routes';
import { businessRouter } from './routes/business.routes';
import { catalogRouter } from './routes/catalog.routes';
import { ordersRouter } from './routes/orders.routes';
import { qrRouter } from './routes/qr.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { billingRouter } from './routes/billing.routes';
import { publicRouter } from './routes/public.routes';

const app = express();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin image loading for store items
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Business WhatsApp QR SaaS API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/business', businessRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/qr', qrRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/public', publicRouter);

// 404 Handler for API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route does not exist.',
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 Business WhatsApp QR API running on http://localhost:${config.port}`);
  });
}

export default app;
