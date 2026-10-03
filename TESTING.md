# Testing Guide & Quality Assurance

This document describes the testing suites, benchmarks, and commands used to validate the **Business WhatsApp QR** platform.

---

## 🧪 Test Suites

### 1. Backend Unit Tests
- **`server/tests/whatsapp.test.ts`**:
  - Normalization of 10-digit, 11-digit (with 0), and 12-digit Indian phone numbers
  - Rejection of invalid phone formats
  - Structured WhatsApp message formatting with currency symbols, emojis, variant labels, and notes
  - URL deep-link encoding (`https://wa.me/...`)
- **`server/tests/businessHours.test.ts`**:
  - Evaluation of operating hours in Asia/Kolkata timezone
  - Verification of manual Open/Closed store override

### 2. Backend Integration & Security Tests
- **`server/tests/api.test.ts`**:
  - Merchant registration, login, and JWT verification
  - Prevention of duplicate account registration
  - Guided business onboarding flow
  - Category creation and sorting
  - Product creation with variant groups & add-ons
  - Public storefront catalog query
  - Authoritative server order calculation and pricing verification
  - IDOR protection preventing cross-tenant access

### 3. Frontend Unit Tests
- **`client/src/tests/cartStore.test.ts`**:
  - Empty cart initial state
  - Item addition and subtotal calculation
  - Multi-tier variant pricing and add-on price additions
  - Quantity modifications and zero-quantity auto-removal

---

## 🏃 Running Tests

Run all unit and integration tests across both workspaces:
```bash
npm run test
```

To run server tests only:
```bash
npm run test --workspace=server
```

To run client tests only:
```bash
npm run test --workspace=client
```

---

## 📋 Pre-Flight Quality Gate Checklist

- [x] Application builds successfully (`npm run build`)
- [x] TypeScript passes without errors (`npx tsc --noEmit`)
- [x] Database migrations & schema push work cleanly
- [x] Seed data populates demo restaurant smoothly
- [x] Authoritative pricing engine verifies totals
- [x] WhatsApp URL encoding handles special characters, currency (₹), and line breaks
- [x] QR code generator outputs PNG and SVG
- [x] Print designer generates Table Tent, Counter Stand, and A4 Poster layouts
- [x] Mobile-first layout tested across viewports (320px–1920px)
- [x] Rate limiting active on authentication and orders
