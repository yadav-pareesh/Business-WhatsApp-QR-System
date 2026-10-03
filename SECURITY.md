# Security Policy & Architecture

Security and data integrity are fundamental to the **Business WhatsApp QR** platform. This document outlines our defense-in-depth security model.

---

## 🛡️ Core Security Controls

### 1. Insecure Direct Object Reference (IDOR) Defense
- All mutation and retrieval endpoints enforcing ownership verify that the authenticated `req.user.userId` owns the target `businessId`.
- Random CUIDs and non-sequential human identifiers (e.g. `#ABC-1024`) prevent sequential enumeration attacks on orders or merchants.

### 2. Client-Side Price Tamper Resistance
- The client-side browser is treated as completely untrusted.
- Totals, discounts, tax calculations, and item prices are authoritatively recalculated server-side using active database records.
- Tampered quantities (e.g. negative numbers, zero, or floats) are rejected with validation errors.

### 3. Rate Limiting & Abuse Prevention
- **Authentication Endpoints:** Limited to 30 requests per 15 minutes per IP to prevent brute-force attacks on passwords.
- **Public Order Submissions:** Rate-limited to 20 submissions per minute per IP to prevent automated order spam.
- **General Public APIs:** Throttled to 120 requests per minute to prevent scraping.

### 4. Input Sanitization & Validation
- Strict request validation using **Zod** schemas on both backend and frontend.
- Phone numbers are validated and normalized to strict international digit formats (`91XXXXXXXXXX`).
- WhatsApp messages are sanitized and properly escaped using `encodeURIComponent` to prevent XSS and URL injection.

### 5. HTTP & Transport Security
- **Helmet:** Enabled with secure headers including HSTS, X-Content-Type-Options, and Frameguard.
- **CORS:** Controlled origin handling.
- **Password Hashing:** Passwords hashed with `bcryptjs` using a salt work factor of 10.
- Secrets are stored exclusively in environment variables (`.env`) and never exposed in client bundles.

---

## 🔍 Vulnerability Reporting

If you discover a security vulnerability, please email `security@whatsappqr.in`. We commit to reviewing reports within 24 hours.
