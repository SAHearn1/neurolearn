# NeuroLearn — Technical Specifications

## Table of Contents

1. [Dependencies](#dependencies)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Security](#security)
6. [Performance Targets](#performance-targets)

---

## Dependencies

### Runtime

| Package               | Version | Purpose                            |
| --------------------- | ------- | ---------------------------------- |
| react                 | ^18.3.0 | UI framework                       |
| react-dom             | ^18.3.0 | DOM renderer                       |
| react-router-dom      | ^6.22.0 | Client-side routing                |
| @supabase/supabase-js | ^2.39.0 | Backend client (DB, Auth, Storage) |
| zustand               | ^4.5.0  | Lightweight state management       |
| tailwindcss           | ^3.4.0  | Utility-first CSS framework        |

### Development

| Package                | Version | Purpose                   |
| ---------------------- | ------- | ------------------------- |
| vite                   | ^5.1.0  | Build tool and dev server |
| typescript             | ^5.3.0  | Type safety               |
| @vitejs/plugin-react   | ^4.2.0  | React Fast Refresh        |
| vitest                 | ^1.3.0  | Unit testing              |
| @testing-library/react | ^14.2.0 | Component testing         |
| eslint                 | ^8.57.0 | Linting                   |
| prettier               | ^3.2.0  | Code formatting           |
| postcss                | ^8.4.0  | CSS processing            |
| autoprefixer           | ^10.4.0 | Vendor prefixing          |

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Vite + TypeScript + Tailwind CSS) │
└────────────────┬────────────────────┘
                 │ HTTPS / REST / Realtime
┌────────────────▼────────────────────┐
│              Supabase               │
│  ┌──────────┐  ┌──────────────────┐ │
│  │   Auth   │  │   PostgreSQL DB  │ │
│  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Storage  │  │   Edge Functions │ │
│  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────┘
```

### Frontend Layers

| Layer      | Directory         | Description                    |
| ---------- | ----------------- | ------------------------------ |
| Pages      | `src/pages/`      | Top-level route components     |
| Components | `src/components/` | Reusable UI components         |
| Hooks      | `src/hooks/`      | Custom React hooks             |
| Store      | `src/store/`      | Zustand state slices           |
| Utils      | `utils/`          | Shared helper functions        |
| Styles     | `src/styles/`     | Global CSS and Tailwind config |

---

## Database Schema

### `users` (managed by Supabase Auth)

| Column     | Type        | Notes       |
| ---------- | ----------- | ----------- |
| id         | uuid        | Primary key |
| email      | text        | Unique      |
| created_at | timestamptz | Auto        |

### `profiles`

| Column              | Type        | Notes                           |
| ------------------- | ----------- | ------------------------------- |
| id                  | uuid        | FK → users.id                   |
| display_name        | text        |                                 |
| avatar_url          | text        | Nullable                        |
| learning_style      | text        | visual / auditory / kinesthetic |
| sensory_preferences | jsonb       | Font size, contrast, motion     |
| created_at          | timestamptz | Auto                            |
| updated_at          | timestamptz | Auto                            |

### `courses`

| Column      | Type        | Notes                              |
| ----------- | ----------- | ---------------------------------- |
| id          | uuid        | Primary key                        |
| title       | text        |                                    |
| description | text        |                                    |
| difficulty  | text        | beginner / intermediate / advanced |
| tags        | text[]      | Subject labels                     |
| created_at  | timestamptz | Auto                               |

### `lessons`

| Column       | Type        | Notes                              |
| ------------ | ----------- | ---------------------------------- |
| id           | uuid        | Primary key                        |
| course_id    | uuid        | FK → courses.id                    |
| title        | text        |                                    |
| content_type | text        | text / audio / video / interactive |
| content_url  | text        | Nullable                           |
| content_body | text        | Nullable                           |
| order_index  | integer     |                                    |
| created_at   | timestamptz | Auto                               |

### `progress`

| Column       | Type        | Notes            |
| ------------ | ----------- | ---------------- |
| id           | uuid        | Primary key      |
| user_id      | uuid        | FK → users.id    |
| lesson_id    | uuid        | FK → lessons.id  |
| completed    | boolean     | Default false    |
| score        | integer     | Nullable (0–100) |
| completed_at | timestamptz | Nullable         |

---

## API Endpoints

All API access goes through the Supabase client library. The following operations are supported:

### Auth

| Operation | Method                               | Description                        |
| --------- | ------------------------------------ | ---------------------------------- |
| Sign up   | `supabase.auth.signUp()`             | Create account with email/password |
| Sign in   | `supabase.auth.signInWithPassword()` | Email/password login               |
| Sign out  | `supabase.auth.signOut()`            | Invalidate session                 |
| OAuth     | `supabase.auth.signInWithOAuth()`    | Google / GitHub SSO                |

### Profiles

| Operation      | Table             | Description                 |
| -------------- | ----------------- | --------------------------- |
| Read profile   | `profiles` SELECT | Fetch current user profile  |
| Update profile | `profiles` UPDATE | Update learning preferences |

### Courses & Lessons

| Operation    | Table            | Description                 |
| ------------ | ---------------- | --------------------------- |
| List courses | `courses` SELECT | Fetch all available courses |
| Get course   | `courses` SELECT | Fetch single course by id   |
| List lessons | `lessons` SELECT | Fetch lessons by course_id  |
| Get lesson   | `lessons` SELECT | Fetch single lesson         |

### Progress

| Operation     | Table             | Description           |
| ------------- | ----------------- | --------------------- |
| Get progress  | `progress` SELECT | Fetch user progress   |
| Mark complete | `progress` UPSERT | Mark lesson completed |

---

## Security

### Environment Variables & Secrets

| Variable                    | Scope            | Sensitivity | Where stored                         |
| --------------------------- | ---------------- | ----------- | ------------------------------------ |
| `VITE_SUPABASE_URL`         | Client (browser) | Public      | `.env.local`, Vercel env             |
| `VITE_SUPABASE_ANON_KEY`    | Client (browser) | Public      | `.env.local`, Vercel env             |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only      | **Secret**  | `.env.local`, Vercel env (encrypted) |
| `SUPABASE_DB_URL`           | Server only      | **Secret**  | `.env.local`, Vercel env (encrypted) |
| `VITE_APP_URL`              | Client (browser) | Public      | `.env.local`, Vercel env             |

**Rules:**

- All secrets live in `.env.local` locally and Vercel Environment Variables in production
- `.env.local` is git-ignored — never committed
- Only `VITE_*` variables are exposed to the browser bundle (Vite convention)
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`) must **never** be prefixed with `VITE_`
- `.env.example` contains placeholder values for documentation — **no real credentials**

### Git Security

- `.gitignore` blocks all `.env.*` files except `.env.example`
- Private keys (`*.pem`, `*.key`), certificates, and service account JSON files are git-ignored
- Pre-commit checks should verify no secrets are staged (see `git-secrets` or `gitleaks`)

### Supabase Security

- All database access is mediated through **Row Level Security (RLS)** policies
- Users can only read/write their own `profiles` and `progress` rows
- The `anon` key is safe for client use — it only grants access permitted by RLS policies
- Sensitive operations (admin, bulk writes) require **Edge Functions** with the `service_role` key
- The `service_role` key bypasses RLS and must **never** be exposed to the client

### Vercel Deployment Security

- Environment variables are set in the Vercel dashboard under **Settings → Environment Variables**
- Sensitive values are encrypted at rest by Vercel
- Preview deployments use separate environment scopes (Preview vs Production)
- The production URL is `https://neurolearn-one.vercel.app`
- OAuth callback URLs must be registered in Supabase Auth → URL Configuration

---

## Performance Targets

| Metric                   | Target           |
| ------------------------ | ---------------- |
| Lighthouse Performance   | ≥ 90             |
| Lighthouse Accessibility | ≥ 95             |
| First Contentful Paint   | < 1.5 s          |
| Time to Interactive      | < 3.5 s          |
| Bundle size (gzip)       | < 200 KB initial |

---

## RACA Production Activation Checklist (REQ-18-09)

Full runbook: `docs/raca-production-activation.md`

### Pre-flight

- [ ] Supabase migrations 035 + 036 applied (`supabase db push`)
- [ ] `ANTHROPIC_API_KEY` set in Supabase Edge Function secrets
- [ ] `RACA_AI_MODEL=claude-sonnet-4-6` set in Supabase Edge Function secrets
- [ ] Edge functions deployed: `agent-invoke`, `epistemic-analyze`

### Vercel: RACA flags (Production + Preview environments)

Enable in this order — each layer must be smoke-tested before activating the next:

1. `VITE_RACA_ENABLE_RUNTIME=true`
2. `VITE_RACA_ENABLE_COGNITIVE_FSM=true`
3. `VITE_RACA_ENABLE_GUARDRAILS=true`
4. `VITE_RACA_ENABLE_AUDIT=true`
5. `VITE_RACA_ENABLE_AGENT_ROUTER=true`
6. `VITE_RACA_ENABLE_AGENTS=true`
7. `VITE_RACA_ENABLE_EPISTEMIC=true`
8. `VITE_RACA_ENABLE_ADAPTATION=true`

### Verification

- [ ] `SessionPage` loads for a test learner in production
- [ ] `raca_audit_events` table receives events after session start
- [ ] `epistemic_profiles` populated after completing a session
- [ ] `agent-invoke` Edge Function returns a valid response
