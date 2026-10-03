# Setup Guide

Follow this guide to get **Business WhatsApp QR** running on your local machine.

---

## 📋 System Requirements

- **Operating System:** Windows, macOS, or Linux
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Package Manager:** npm v9+

---

## 🛠️ Step-by-Step Installation

### Step 1: Install Dependencies
From the repository root directory, run:
```bash
npm install
```
This leverages npm workspaces to install all root, backend (`server`), and frontend (`client`) packages simultaneously.

---

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

2. Review `server/.env` parameters:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="business_whatsapp_qr_dev_secret_key_1234567890123456"
APP_URL="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

---

### Step 3: Initialize Database & Prisma Client

Generate the Prisma Client and create your local SQLite database:
```bash
# Generate Prisma Client TypeScript types
npm run prisma:generate --workspace=server

# Synchronize database schema and create dev.db
npm run prisma:push --workspace=server
```

---

### Step 4: Seed Demo Data

Populate the database with a realistic demo restaurant (`ABC Restaurant`):
```bash
npm run seed
```

This sets up:
- Demo merchant account: `owner@abcrestaurant.com` / `DemoPassword123!`
- 4 categories: Pizzas, Burgers & Wraps, Beverages, Desserts
- Products with portion variants (Regular/Medium/Large) and crust add-ons
- Sample completed & in-progress orders for the dashboard
- Aggregated analytics scan events

---

### Step 5: Start Development Servers

Run both Express API (Port 5000) and Vite frontend (Port 5173):
```bash
npm run dev
```

Open your browser to:
- **Landing Page:** [http://localhost:5173](http://localhost:5173)
- **Customer Storefront:** [http://localhost:5173/business/abc-restaurant](http://localhost:5173/business/abc-restaurant)
- **Merchant Login:** [http://localhost:5173/login](http://localhost:5173/login)

---

## 🗃️ Database Management

To inspect or edit database tables visually, use Prisma Studio:
```bash
npx prisma studio --schema=server/prisma/schema.prisma
```
This opens Prisma Studio at [http://localhost:5555](http://localhost:5555).
