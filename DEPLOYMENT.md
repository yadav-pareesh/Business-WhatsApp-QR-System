# 🚀 Vercel Deployment & Production Guide

This guide covers deploying the **Business WhatsApp QR System** to **Vercel** with complete reliability, scalability, and performance.

---

## 🏗️ Architecture Overview

The application is structured for a clean, decoupled deployment on Vercel:
1. **Backend Serverless API (`server/`)**: Express API running on Vercel Serverless Functions (`server/api/index.ts`) with Prisma ORM connection pooling.
2. **Frontend SPA (`client/`)**: High-performance React 18 + Vite SPA deployed as static assets on Vercel's Edge CDN with immutable cache headers and client-side routing.
3. **Database**: PostgreSQL (Neon, Supabase, AWS RDS, Prisma Accelerate, or Railway Postgres).

---

## 🗄️ Step 1: Database Setup (PostgreSQL)

You need a hosted PostgreSQL database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)):

1. Obtain your connection string. If using a connection pooler (like Neon pooled or Supabase PgBouncer):
   - `DATABASE_URL`: Your pooled connection URL (e.g., `postgresql://...pooled...`).
   - `DIRECT_URL`: (Optional) Direct connection URL for migrations without pooler timeouts.
2. Push your schema to initialize tables:
   ```bash
   cd server
   npx prisma db push
   ```
3. (Optional) Seed demo data:
   ```bash
   npm run seed
   ```

---

## ⚡ Step 2: Deploy Backend to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
2. Import this repository.
3. In **Project Settings**:
   - **Project Name**: e.g., `bwqr-api`
   - **Root Directory**: Click *Edit* and select **`server`**.
   - **Framework Preset**: *Other*
   - **Build Command**: `prisma generate && tsc` (or leave default if reading `package.json`)
   - **Output Directory**: Leave empty / default
4. Add **Environment Variables** in Vercel:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `DATABASE_URL` | `postgresql://...` | Hosted PostgreSQL connection string |
   | `DIRECT_URL` | `postgresql://...` | (Optional) Direct connection URL |
   | `JWT_SECRET` | *(64-char random string)* | Secret for auth tokens |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Frontend production URL (or comma-separated) |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Frontend base URL |
   | `STRIPE_SECRET_KEY`| `sk_live_...` or `sk_test_...` | Stripe secret key |
5. Click **Deploy**.
6. Once deployed, copy your backend URL (e.g., `https://bwqr-api.vercel.app`). Verify health at `https://bwqr-api.vercel.app/api/health`.

---

## 🌐 Step 3: Deploy Frontend to Vercel

1. In your [Vercel Dashboard](https://vercel.com), click **Add New > Project**.
2. Select the **same repository**.
3. In **Project Settings**:
   - **Project Name**: e.g., `bwqr-client`
   - **Root Directory**: Click *Edit* and select **`client`**.
   - **Framework Preset**: **Vite**
   - **Build Command**: `tsc && vite build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://bwqr-api.vercel.app/api` | Your deployed backend API URL from Step 2 |
5. Click **Deploy**.
6. Once deployed, copy your frontend domain (e.g. `https://bwqr-client.vercel.app`).
7. **Important**: Go back to your Backend Vercel project settings (`bwqr-api`), update `CORS_ORIGIN` and `FRONTEND_URL` to match your frontend domain (`https://bwqr-client.vercel.app`), and redeploy.

---

## 🛡️ Robustness & Optimizations Built-In

1. **Serverless Connection Management**: Prisma Client is instantiated as a cached global singleton to avoid connection exhaustion across warm serverless invocations.
2. **CORS Compliance**: Strict CORS with credentials support configured to accept multiple trusted production origins via `CORS_ORIGIN`.
3. **Reverse Proxy Trust**: `app.set('trust proxy', 1)` enabled for accurate rate limiting and client IP resolution behind Vercel edge reverse proxies.
4. **Resilient Rate Limiting**: Intelligent rate limits that protect authentication and order creation without throttling legitimate traffic or test suites.
5. **Authoritative Server-side Calculations**: Prices and tax calculations are strictly evaluated on the server — never trusting client-submitted totals.
6. **Unique Order Generation**: Collison-resistant order numbers (`#ABC-1234`) ensuring smooth search and WhatsApp communication.
7. **Production Error Boundaries**: Database constraint violations (`P2002`, `P2025`) mapped to standard HTTP statuses (`409 Conflict`, `404 Not Found`) instead of crashing with 500 errors.
8. **Static Asset Caching**: 1-year immutable caching on CSS and JavaScript bundles for instant page loads.
