# NeuroLearn — Setup Guide

Step-by-step instructions for setting up a local development environment.

---

## Prerequisites

| Tool    | Minimum Version | Install                            |
| ------- | --------------- | ---------------------------------- |
| Node.js | 18.x LTS        | [nodejs.org](https://nodejs.org)   |
| npm     | 9.x             | Included with Node.js              |
| Git     | 2.x             | [git-scm.com](https://git-scm.com) |

You will also need a free [Supabase](https://supabase.com) account.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/SAHearn1/neurolearn.git
cd neurolearn
```

## Step 2 — Install Dependencies

```bash
npm install
```

## Step 3 — Create a Supabase Project

1. Sign in at [supabase.com](https://supabase.com)
2. Click **New Project** and fill in the details
3. Wait for the project to provision (~1 minute)
4. Go to **Project Settings → API**
5. Copy the **Project URL** and **anon (public) key**

## Step 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

## Step 5 — Run Database Migrations

If your project has Supabase migrations (in `supabase/migrations/`):

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your remote project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Alternatively, run the SQL files manually in the Supabase **SQL Editor**.

## Step 6 — Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the NeuroLearn home page.

---

## Useful Commands

```bash
npm run build       # Build for production (output: dist/)
npm run preview     # Preview the production build locally
npm run test        # Run unit tests
npm run lint        # Lint source files
npm run typecheck   # Check TypeScript types
```

---

## Environment Variable Reference

| Variable                    | Required | Scope  | Description                                    |
| --------------------------- | -------- | ------ | ---------------------------------------------- |
| `VITE_SUPABASE_URL`         | ✅       | Client | Supabase project URL                           |
| `VITE_SUPABASE_ANON_KEY`    | ✅       | Client | Supabase anon (public) key                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Fns | Server | Bypasses RLS — **never expose to client**      |
| `SUPABASE_DB_URL`           | Edge Fns | Server | Direct PostgreSQL connection string            |
| `VITE_APP_URL`              | ✅       | Client | App base URL (`http://localhost:5173` locally) |
| `VITE_APP_ENV`              | Optional | Client | `development` / `production`                   |

> **Security:** Only `VITE_*` variables are bundled into the browser. Server-only secrets must never be prefixed with `VITE_`.

---

## Vercel Deployment

The app is deployed on Vercel at **https://neurolearn-one.vercel.app**.

### Auto-deploy

Pushes to `main` trigger automatic production deployments via the connected GitHub repo.

### Environment Variables (Vercel)

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable                    | Environments        | Sensitive           |
| --------------------------- | ------------------- | ------------------- |
| `VITE_SUPABASE_URL`         | Production, Preview | No                  |
| `VITE_SUPABASE_ANON_KEY`    | Production, Preview | No                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Production          | **Yes** (encrypted) |
| `SUPABASE_DB_URL`           | Production          | **Yes** (encrypted) |
| `VITE_APP_URL`              | Production          | No                  |

Or set via CLI:

```bash
vercel env add VITE_SUPABASE_URL         # paste project URL
vercel env add VITE_SUPABASE_ANON_KEY    # paste anon key
vercel env add SUPABASE_SERVICE_ROLE_KEY # paste service role key (sensitive)
```

### OAuth Callback URLs

Register in **Supabase Dashboard → Auth → URL Configuration**:

- Site URL: `https://neurolearn-one.vercel.app`
- Redirect URLs:
  - `https://neurolearn-one.vercel.app/auth/callback`
  - `http://localhost:5173/auth/callback` (for local dev)

---

## VS Code Recommended Extensions

The following extensions improve the development experience:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Vue Plugin / Volar** (if using Vue alongside)

---

## Next Steps

- Read the [Developer Guide](DEVELOPER_GUIDE.md) for architecture details and code conventions
- Review [Technical Specs](TECHNICAL_SPECS.md) for the full database schema and API reference
- Check [Contributing](CONTRIBUTING.md) before opening a pull request
