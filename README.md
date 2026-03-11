# 🚀 Sales Insight Automator — Engineer's Log


## 🌐 Live URLs (Placeholders)
| Service | URL |
|---------|-----|
| Frontend | `http://localhost:80` |
| Backend API | `http://localhost:5001` |
| Swagger Docs | `http://localhost:5001/api-docs` |

---

## ⚡ Quick Start with Docker

```bash
git clone <repo>
cd sales-insight-automator

# Copy and fill environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your Gemini API key, Gmail credentials, etc.

# Build and run everything
docker compose up --build

# Frontend: http://localhost:80
# Backend:  http://localhost:5001

```

### Local Development (without Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env  # fill in keys
npm run dev           # runs on :5001

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL=http://localhost:5001
npm run dev           # runs on :5173
```

---

## 🔒 Security Measures

| Measure | Implementation |
|---------|---------------|
| **Helmet** | Security-hardened HTTP headers on every response |
| **CORS** | Whitelist-only — only `FRONTEND_URL` can access the API |
| **Rate Limiting** | 10 requests per IP per 15 minutes (`express-rate-limit`) |
| **File Validation** | MIME type + extension checked before processing |
| **5MB Upload Cap** | Multer rejects oversized payloads immediately |
| **Env Secrets** | All keys stored in `.env`, never in codebase |
| **Non-root Docker** | Backend container runs as unprivileged `appuser` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  React (Vite) · Glassmorphism Sci-Fi UI          │    │
│  │  Particle Canvas · 3D Cards · Animated Charts    │    │
│  └─────────────────────────┬───────────────────────┘    │
└────────────────────────────│────────────────────────────┘
                             │ POST /api/upload
                             │ multipart/form-data
                ┌────────────▼───────────────┐
                │     nginx: alpine           │
                │  (static SPA + proxy)      │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │   Express.js Backend       │
                │                            │
                │  rateLimiter middleware     │
                │  fileValidator middleware   │
                │          │                 │
                │   upload.controller.js     │
                │     │         │      │     │
                │  Parser   Gemini  Mailer   │
                │  (Papa/  (1.5-   (Node-   │
                │  xlsx)   Flash)  mailer)  │
                └────────────────────────────┘
```

---

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend port | `5001` |
| `GEMINI_API_KEY` | Google AI Studio key | `AIza...` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Gmail address | `you@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `FRONTEND_URL` | CORS whitelist | `http://localhost:5173` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:5001` |

> **Gmail Setup**: Enable 2FA → Google Account → Security → App Passwords → Generate 16-char password

---

## 🚢 Deployment Guide

### Frontend → Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `frontend`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy → Vercel auto-detects Vite

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. **Build command**: `npm ci --omit=dev`
5. **Start command**: `node server.js`
6. Add all env vars from `.env.example`
7. Deploy

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, CSS Keyframes, Canvas API |
| Backend | Node.js 20, Express 4, Multer, Helmet, CORS |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Parsing | PapaParse (CSV), xlsx (XLSX) |
| Email | Nodemailer + Gmail SMTP |
| Docs | Swagger UI + OpenAPI 3.0 |
| Container | Docker, nginx:alpine, docker compose |
| CI/CD | GitHub Actions |

---

*Built with ⚡ by RabbitAI — Where data meets deep space.*
