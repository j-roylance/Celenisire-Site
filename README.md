# Celenisire: Humankind Resilience Initiative

Production-ready full-stack website for an early-stage charity initiative researching technology to prevent catastrophe and relieve human suffering.

## Legal Status

**Celenisire: Humankind Resilience Initiative** is currently an early-stage, self-funded research initiative. It has **not yet completed legal nonprofit formation**. Contributions may **not be tax-deductible**. The website uses transparent language throughout and does not claim 501(c)(3) status.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, React Router, TanStack React Query |
| Backend | Express, TypeScript |
| Database | Supabase PostgreSQL via Prisma |
| Auth | Custom email/password (bcrypt + JWT in httpOnly cookies) |
| Hosting | Vercel (single project) |

## Project Structure

```
/
├── api/index.ts          # Vercel serverless handler
├── client/               # React frontend
├── server/               # Express API + Prisma
├── vercel.json
└── package.json          # npm workspaces root
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Supabase account (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in all values in `.env` (see Environment Variables below).

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database**
3. Copy the **Connection string (URI)** for `DATABASE_URL` (use "Transaction" pooler mode)
4. Copy the **Direct connection** string for `DIRECT_URL`
5. Replace `[YOUR-PASSWORD]` with your database password

### 4. Run database migrations

```bash
npm run db:push
npm run db:seed
```

### 5. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

The Vite dev server proxies `/api/*` to the Express server.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL pooled connection string |
| `DIRECT_URL` | Supabase direct connection string (for migrations) |
| `JWT_SECRET` | Secret for JWT signing (min 32 characters) |
| `CLIENT_URL` | Frontend URL (`http://localhost:5173` for dev) |
| `PORT` | Express server port (default: `3001`) |
| `NODE_ENV` | `development` or `production` |
| `SUPABASE_URL` | Supabase project URL (required for PDF uploads) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, for Storage uploads) |

### Supabase Storage (PDF uploads)

For admin PDF uploads, create two public buckets in the Supabase dashboard:

1. **`financial-reports`** — public read access for published report PDFs
2. **`research-publications`** — public read access for published research PDFs

Set both buckets to allow public read. The server uses the service role key to upload and delete files. If Supabase Storage is not configured, admins can still attach documents via external URL.


## Prisma Commands

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Create and run migrations
npm run db:seed       # Seed placeholder projects
npm run db:studio     # Open Prisma Studio
```

## Admin Account

1. Navigate to `/register`
2. Create an account — **the first registered user receives ADMIN role**
3. Subsequent registrations receive VIEWER role

> **Warning:** Admin registration is open during development. Restrict it before production (see Future TODOs).

## Vercel Deployment

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set **Root Directory** to the repository root (not `client/`)
4. Add all environment variables from `.env.example` in the Vercel dashboard
5. Deploy

Vercel configuration:
- Build command: `npm run build`
- Output directory: `client/dist`
- API routes: `/api/*` → serverless Express handler

Set `CLIENT_URL` to your production domain (e.g. `https://celenisire.org`).

## Public Routes

| Route | Description |
|---|---|
| `/financial-reports` | Published financial transparency reports |
| `/financial-reports/:slug` | Individual report detail + PDF link |
| `/research` | Published research publications |
| `/research/:slug` | Individual publication detail + PDF link |

## Admin Routes

| Route | Roles (write) |
|---|---|
| `/admin/financial-reports` | ADMIN, ACCOUNTANT |
| `/admin/research-publications` | ADMIN, EDITOR |

## Future TODOs

- [ ] Complete legal nonprofit formation
- [ ] Add payment processor (Stripe)
- [ ] Restrict admin registration before production
- [ ] Add email provider (transactional + campaigns)

## License

Private — All rights reserved.
