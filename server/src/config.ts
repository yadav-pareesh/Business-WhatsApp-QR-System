import dotenv from 'dotenv';
import path from 'path';

// In Vercel serverless, env vars are injected by the platform directly.
// Only load .env files during local development.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Support cloud providers (Vercel, Render, Railway, Neon) injecting POSTGRES_URL or PRISMA_DATABASE_URL
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL || '';
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_whatsapp_qr_super_secure',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  databaseUrl: process.env.DATABASE_URL || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
};
