# Deployment Guide

This guide covers deploying the **Business WhatsApp QR** platform to modern production infrastructure.

---

## 🏗️ Architecture Overview

The system is designed as a decoupled full-stack architecture:
1. **Frontend:** Static Single-Page Application (SPA) deployed to edge CDNs (Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront).
2. **Backend API:** Containerized or Node.js runtime deployed to modern cloud services (Render, Railway, Fly.io, DigitalOcean, or AWS ECS/AppRunner).
3. **Database:** Managed PostgreSQL instance (Supabase, Neon, AWS RDS, Railway, Render Postgres).

---

## 🗄️ Database: PostgreSQL Setup

In development, the app uses SQLite. For production, switch to PostgreSQL:

1. Update `server/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Supply your production PostgreSQL connection string in `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@host:5432/whatsapp_qr?sslmode=require"
```

3. Run schema migration on your production database:
```bash
npx prisma db push
```

---

## 🚀 Deploying the Backend API (Render / Railway / VPS)

### 1. Build & Start Commands
- **Build Command:** `npm run build --workspace=server && npm run prisma:generate --workspace=server`
- **Start Command:** `npm run start --workspace=server`

### 2. Environment Variables
Configure the following in your cloud dashboard:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_long_random_production_secret_key_at_least_32_characters
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## 🌐 Deploying the Frontend (Vercel / Netlify)

### 1. Build Settings
- **Root Directory:** `client` (or set Root Directory in Vercel settings to `client`)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 2. Rewrites / SPA Routing Configuration
For Vercel, ensure `client/vercel.json` contains:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://api.yourdomain.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

For Netlify, ensure `client/_redirects` contains:
```
/api/*  https://api.yourdomain.com/api/:splat  200
/*      /index.html                            200
```
