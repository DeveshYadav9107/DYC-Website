# DY&C Business Solution

A full-stack business website for DY&C, focused on SAP consulting, staffing solutions, and enterprise ERP services.

The project includes a responsive React website, an Express REST API, MongoDB persistence, contact inquiry management, and a protected admin area.

## Features

- Public business website with home, about, industries, SAP capabilities, services, and contact pages
- Responsive UI built with React, Vite, Tailwind CSS, and Framer Motion
- Contact inquiry submission through the backend API
- Protected admin login using JWT authentication
- Admin dashboard for reviewing inquiries and managing site settings
- MongoDB integration through Mongoose
- Cloudinary support for managed media uploads
- Health-check endpoints for deployment platforms
- SPA fallback support for both split and unified deployments

## Technology Stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, JWT, Mongoose
- **Database:** MongoDB / MongoDB Atlas
- **Validation and forms:** React Hook Form, Express Validator
- **Deployment:** Vercel or Netlify for the client; Render, Railway, or a unified Node service for the backend

## Project Structure

```text
DYC/
├── client/       React + Vite frontend
├── server/       Express REST API and database layer
├── DEPLOYMENT.md Detailed deployment instructions
├── package.json  Root monorepo scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database for the server

### Install dependencies

From the project root:

```bash
npm run install:all
```

### Configure environment variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/dyc_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Create `client/.env` only when the API is not running on the same origin:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Never commit `.env` files, database credentials, JWT secrets, or Cloudinary secrets to GitHub.

### Start the application

Run the frontend and backend in separate terminals:

```bash
npm run client
npm run server
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

To create the initial admin user, run:

```bash
npm run seed
```

Change the seeded password before using the application in production.

## Available Scripts

Run these commands from the project root:

| Command | Description |
| --- | --- |
| `npm run install:all` | Install client and server dependencies |
| `npm run client` | Start the Vite development server |
| `npm run server` | Start the API with Node watch mode |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the production API server |
| `npm run seed` | Seed the initial admin user |

## Routes

### Public frontend routes

- `/`
- `/about`
- `/industries`
- `/sap-capabilities`
- `/services/:serviceId`
- `/contact`

### Admin frontend routes

- `/admin/login`
- `/admin`
- `/admin/inquiries`
- `/admin/settings`

Admin pages require authentication.

### API routes

The API is mounted at `/api/v1` and currently includes:

- `/auth`
- `/inquiries`
- `/settings`

Health checks are available at `/health` and `/api/health`.

## Production Deployment

For full instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

The recommended setup is:

1. Deploy `server` as a Node.js web service on Render or Railway.
2. Configure MongoDB Atlas and the server environment variables.
3. Deploy `client` as a Vite application on Vercel or Netlify.
4. Set `VITE_API_URL` to the deployed API URL.
5. Add the frontend URL to the server's `CLIENT_URL` setting.

The project also supports a unified deployment from the repository root. Build the client first, then start the server:

```bash
npm run install:all
npm run build
npm start
```

When `client/dist` exists, the Express server serves the built frontend and API from the same service.

## Security Notes

- Use a strong, unique `JWT_SECRET` in production.
- Restrict `CLIENT_URL` to trusted frontend domains.
- Do not use the seeded admin password in production.
- Keep MongoDB and Cloudinary credentials in your hosting provider's secret manager.
- Review and verify company metrics and contact details in `client/src/config/siteConfig.js` before publishing.

## License

This project is private business software for DY&C. Add your preferred license here before making the repository public.
