# Highway 10 Food Court

Jamnagar's biggest hangout on the highway — MERN website for the multi-brand food court on SH-25.

## Stack

- **Client:** React + Vite + Tailwind CSS v4 + Framer Motion + React Router
- **Server:** Express + MongoDB (optional; falls back to in-memory) + Nodemailer

## Quick start

```bash
# Install
cd client && npm install
cd ../server && npm install

# Terminal 1 — API
cd server
cp .env.example .env   # optional Mongo / SMTP
npm run dev

# Terminal 2 — site
cd client
npm run dev
```

Open http://localhost:5173 — API proxies `/api` → `:5000`.

## Image map

| File | Used as |
|------|---------|
| `hero-dusk.png` | Home hero (full-bleed) |
| `entrance-night.png` | Gallery banner + About hero |
| `interior.jpg` | About interior + gallery grid |

## Design

Drive-down-the-highway metaphor: vertical route line + exit-numbered sections, asphalt / paper-cream rhythm, Oswald + Work Sans + Roboto Mono.
