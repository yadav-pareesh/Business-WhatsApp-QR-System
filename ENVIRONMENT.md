# Environment Variables Reference

This document catalogs all environment variables used by the **Business WhatsApp QR** system across backend and frontend environments.

---

## 🔧 Backend Configuration (`server/.env`)

| Variable | Required | Default (Dev) | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | Port on which the Express HTTP server listens. |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`). |
| `DATABASE_URL` | **Yes** | `file:./dev.db` | Prisma datasource connection URL. Use `postgresql://...` for production. |
| `JWT_SECRET` | **Yes** | `dev_secret_key...` | Cryptographic secret used to sign and verify JWT authentication tokens. Must be >= 32 characters in production. |
| `APP_URL` | No | `http://localhost:5173` | Public origin URL for the web application. |
| `FRONTEND_URL` | No | `http://localhost:5173` | Target domain used when generating stable public QR code links. |

---

## 🌐 Frontend Configuration

Vite proxies `/api` requests to `http://localhost:5000` during local development (configured in `client/vite.config.ts`). In production, use reverse proxy rewrites (as documented in `DEPLOYMENT.md`) or point client requests to your production API origin.

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** containing private secrets to version control.
2. Keep `.env.example` updated whenever new variables are introduced.
3. In production, rotate `JWT_SECRET` regularly.
