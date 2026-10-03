# System Architecture

This document describes the architectural design, data models, and flow patterns of the **Business WhatsApp QR** platform.

---

## 🏛️ High-Level Architectural Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                                │
│                                                                        │
│   Physical QR Card        Mobile Browser (Vite + React)                │
│  ┌────────────────┐      ┌─────────────────────────────┐               │
│  │ Scan Table QR  │ ───► │ /business/:slug             │               │
│  └────────────────┘      │ • Instant catalog load      │               │
│                          │ • Portion size variants     │               │
│                          │ • Custom add-ons            │               │
│                          │ • Bottom drawer cart        │               │
│                          └──────────────┬──────────────┘               │
│                                         │                              │
│                                         ▼                              │
│                            Authoritative Order Submission              │
│                            POST /api/public/order                      │
└─────────────────────────────────────────┼──────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (EXPRESS + NODE.JS)                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Authoritative Pricing Engine (pricing.ts)                        │  │
│  │ • Validates product existence & availability                     │  │
│  │ • Validates variant options & add-on modifiers                   │  │
│  │ • Calculates subtotal, tax rate, and delivery fees                │  │
│  │ • Generates human-friendly order # (#ABC-1024)                   │  │
│  │ • Normalizes recipient WhatsApp number (919876543210)            │  │
│  │ • Builds emoji-accented message payload                          │  │
│  │ • Encodes WhatsApp deep-link: https://wa.me/919876543210?text=   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Database Persistence (Prisma ORM)                                │  │
│  │ • Order record (Status: NEW)                                     │  │
│  │ • Order items with selected options & snapshot prices            │  │
│  │ • Increments QR scan & ORDER_INITIATED analytics                 │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     WHATSAPP DIRECT NOTIFICATION                       │
│                                                                        │
│   Customer's WhatsApp App             Merchant's WhatsApp Device       │
│  ┌─────────────────────────┐         ┌───────────────────────────────┐ │
│  │ Window opens with       │  ─────► │ *New Order for ABC* 🛍️        │ │
│  │ pre-filled message text │         │ Order ID: *#ABC-1024*         │ │
│  │ Customer taps Send!     │         │ • 2 × Pizza (Medium) — ₹500   │ │
│  └─────────────────────────┘         │ Customer: Rahul | Table 4     │ │
│                                      └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Multi-Tenant Data Isolation

- Every merchant business entity has a unique `id` (cuid) and unique `slug` (e.g. `abc-restaurant`).
- Authentication uses JSON Web Tokens (JWT) signed with `JWT_SECRET`.
- The `requireBusinessOwner` middleware validates that `business.ownerId === req.user.userId` before any mutating operation on categories, products, settings, or orders.
- Zero sequential ID exposure prevents enumeration or IDOR vulnerability.

---

## 💰 Authoritative Pricing & Integrity Model

To protect merchants from client-side tampering (e.g. modifying prices in local storage or DevTools):
1. The client sends only: `productId`, `quantity`, `selectedVariantOptionIds`, and `selectedAddonIds`.
2. The server queries the database for authoritative unit prices, variant modifiers, active tax rates, and delivery rules.
3. The server computes the true subtotal and grand total.
4. The generated WhatsApp message deep link uses the server-computed values, ensuring total data consistency.

---

## ⏱️ Timezone & Operating Hours Architecture

- All store open/closed calculations are evaluated on the server using **Asia/Kolkata** (IST: UTC + 5:30) timezone rules, avoiding reliance on arbitrary client device system clocks.
- Supports lunch and dinner split shifts (e.g., 11:00 AM – 3:00 PM and 6:00 PM – 11:00 PM).
- A 1-tap manual override (`isStoreOpenManual`) allows shop owners to temporarily close their store in emergencies without altering their weekly schedule.
