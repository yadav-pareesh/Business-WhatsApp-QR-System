# Business WhatsApp QR

> **Production-Grade Digital Catalog & Direct WhatsApp Ordering SaaS for Small Businesses in India.**

Turn WhatsApp into your complete digital ordering system. Customers scan a table tent or counter QR stand, browse rich photo menus, select portion sizes and add-ons, build their cart, and send structured orders directly to the business's WhatsApp in 1-click — with **0% commission** and **zero app downloads**.

---

## 🎯 Problem Solved

Small restaurants, cafes, bakeries, sweet shops, and local service providers in India face two painful extremes:
1. **Aggregator apps (Zomato/Swiggy)** taking **20% to 30% commission** on every order, withholding customer phone numbers, and delaying payouts.
2. **Expensive POS hardware systems** costing ₹25,000–₹60,000 upfront that are too complex for non-technical shop owners.

**Business WhatsApp QR** solves this cleanly:
- Customer scans physical QR code on table/counter.
- Digital menu opens instantly in mobile browser.
- Customer configures sizes, crusts, toppings, and adds to cart.
- Customer taps "Order on WhatsApp" → opens WhatsApp with verified, formatted order.
- Shop owner receives structured order directly, keeps customer relationships, and collects 100% of payment.

---

## 💼 Commercial Model

- **Setup Fee:** ₹1,999 (one-time assisted setup & catalog creation)
- **Monthly Subscription:** ₹299 / month (cloud hosting, QR service, analytics)
- **Per-Order Commission:** **0% (Zero commission on all orders)**

---

## 🚀 Key Features

- **Mobile-First Experience:** Native app feel with sticky bottom cart drawer, smooth transitions, and zero horizontal scrolling.
- **Stable QR Destinations:** QR codes point to stable business URLs. Merchants can update prices, images, and items anytime without re-printing physical QR stands.
- **Portion Variants & Add-ons:** Supports multi-tiered options (Small/Medium/Large, Crusted crusts, Extra dips, Cheese burst).
- **Authoritative Server Pricing:** Client totals are never trusted. All calculations, variant price modifiers, taxes, and delivery fees are verified on the backend before generating orders.
- **Print-Ready QR Designer:** Built-in designer generates printable Table Stands (4"×6"), Counter Tents (5"×7"), Wall Posters (A4), and Takeaway Cards with high-resolution 300 DPI QR codes and brand logos.
- **Business Hours & Split Shifts:** Configure weekly operating schedules, lunch/dinner split shifts, and 1-tap manual Store Open/Closed overrides.
- **Conversion Analytics:** Track physical QR scans, storefront visits, cart additions, orders initiated, and top 5 bestselling items.
- **Multi-Category Business Presets:** Tailored presets for Restaurants, Cafes, Salons, Clinics, Groceries, Sweet Shops, and Electronics Repair.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand, Canvas Confetti, QRCode.js.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT, BcryptJS, Express Rate Limit, Helmet, Compression.
- **Database:** SQLite (development & local testing) / PostgreSQL (production-ready via Prisma schema).
- **Testing:** Vitest, Supertest.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Clone & Install
```bash
git clone https://github.com/your-username/Business-WhatsApp-QR-System.git
cd Business-WhatsApp-QR-System
npm install
```

### 3. Initialize Database & Seed Demo Data
```bash
# Push schema and create SQLite database
npm run prisma:push --workspace=server

# Seed demo restaurant ("ABC Restaurant")
npm run seed
```

### 4. Run Development Servers
```bash
# Starts Express server on :5000 and Vite dev server on :5173 concurrently
npm run dev
```

### 5. Access the Platform
- **Landing Page & Marketing:** [http://localhost:5173/](http://localhost:5173/)
- **Live Demo Customer Menu:** [http://localhost:5173/demo](http://localhost:5173/demo)
- **Public Storefront:** [http://localhost:5173/business/abc-restaurant](http://localhost:5173/business/abc-restaurant)
- **Merchant Login:** [http://localhost:5173/login](http://localhost:5173/login)
  - Demo Account: `owner@abcrestaurant.com` / `DemoPassword123!`
- **Merchant Dashboard:** [http://localhost:5173/dashboard](http://localhost:5173/dashboard)

---

## 🧪 Testing

```bash
# Run all server and client unit & integration tests
npm run test
```

---

## 📚 Documentation Index

- [SETUP.md](./SETUP.md) — Local installation and database setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture, flow diagrams, data model
- [SECURITY.md](./SECURITY.md) — Security model, IDOR protection, input sanitization
- [TESTING.md](./TESTING.md) — Test suites and quality assurance benchmarks
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment on Vercel, Render, Railway
- [ENVIRONMENT.md](./ENVIRONMENT.md) — Environment variables reference
