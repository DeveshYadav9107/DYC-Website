# Deployment Guide — DY&C Platform

This document provides instructions for deploying the **DY&C** full-stack application to production.

---

## Architecture Overview

- **Frontend (`/client`)**: React 19 + Vite + Tailwind CSS + Framer Motion. Builds to static files in `client/dist`.
- **Backend (`/server`)**: Node.js + Express + MongoDB Atlas + JWT. REST API located at `/api/v1`.
- **Database**: MongoDB Atlas cloud cluster.

---

## Environment Variables

### 1. Server Environment (`server/.env`)
Configure the following in your hosting provider's dashboard (e.g. Render, Railway):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` (Render/Railway set this automatically) |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster.mongodb.net/dyc_db?retryWrites=true&w=majority` |
| `JWT_SECRET` | Strong secret for signing admin JWT tokens | `generate-a-strong-random-key-here-32+chars` |
| `JWT_EXPIRE` | Admin token lifetime | `7d` |
| `CLIENT_URL` | Allowed frontend URL(s) for CORS (comma-separated if multiple) | `https://dycinfo.com,https://dyc-web.vercel.app` |
| `EMAIL_USER` | Gmail address for sending verification OTPs | `deveshrao130@gmail.com` |
| `EMAIL_PASSWORD` | Google 16-character App Password (not Gmail login password) | `pjufigganibdzkqy` |
| `EMAIL_HOST` | SMTP server host (optional, defaults to Gmail) | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port (optional, defaults to 587) | `587` |
| `RESEND_API_KEY` | (Recommended for Render Free Tier) Resend HTTP API key (bypasses port 587 block) | `re_123456789...` |
| `MASTER_OTP` | Cloud emergency fail-safe verification code (default: `999999`) | `999999` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name (optional, for uploads) | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key (optional) | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (optional) | `your_api_secret` |

### 2. Client Environment (`client/.env`)
Configure in your frontend hosting dashboard (e.g. Vercel, Netlify):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Full URL to backend API | `https://your-backend.onrender.com/api/v1` |

*(Note: If deploying client and server unified on the same domain, leave `VITE_API_URL` empty; it will automatically fall back to `/api/v1`)*.

---

## Deployment Options

### Option A: Recommended Split Deployment (Vercel + Render)

#### 1. Deploy Backend on [Render](https://render.com) (or Railway)
1. Create a new **Web Service** connected to your Git repository.
2. Settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
3. Add the **Server Environment Variables** listed above.
4. Once deployed, copy your backend URL (e.g. `https://dyc-api.onrender.com`).

#### 2. Seed Admin User (First Time Setup)
Run from a shell with access to your MongoDB cluster:
```bash
cd server
npm run seed
```
Default credentials created:
- Email: `admin@dycinfo.com`
- Password: `password123` *(Change password in database after initial login)*

#### 3. Deploy Frontend on [Vercel](https://vercel.com) (or Netlify)
1. Import your Git repository into Vercel.
2. Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api/v1`
4. Deploy! SPA rewrites are already handled by `client/vercel.json` and `client/public/_redirects`.
5. Update `CLIENT_URL` in your Render backend settings to include your new Vercel domain.

---

### Option B: Unified Single-Service Deployment (Monorepo)

The Express backend is pre-configured to automatically serve the frontend static build from `client/dist` when available.

1. Create a Web Service connected to your repository root.
2. Settings:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
3. Provide the Server environment variables.
4. Your application will serve both the React client and the Express API on a single port!

---

## Verification & Pre-flight Checklist

- [x] Client production build succeeds: `npm run build` generates `/client/dist` cleanly.
- [x] Server syntax valid across all modules and routes.
- [x] CORS supports single or multiple production domains and localhost fallback.
- [x] Health check endpoints active at `GET /health` and `GET /api/health`.
- [x] SPA refresh redirects handled (`vercel.json` and `_redirects`).
- [x] Admin authentication securely stores tokens and displays proper error messages.
- [x] Inquiry status updates support both `PUT` and `PATCH`.
- [x] Inquiry management in admin dashboard includes CSV export and detail view modal.
- [x] Root `package.json` enables monorepo build and start commands.
