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

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.0 | UI framework |
| react-dom | ^18.3.0 | DOM renderer |
| react-router-dom | ^6.22.0 | Client-side routing |
| @supabase/supabase-js | ^2.39.0 | Backend client (DB, Auth, Storage) |
| zustand | ^4.5.0 | Lightweight state management |
| tailwindcss | ^3.4.0 | Utility-first CSS framework |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^5.1.0 | Build tool and dev server |
| typescript | ^5.3.0 | Type safety |
| @vitejs/plugin-react | ^4.2.0 | React Fast Refresh |
| vitest | ^1.3.0 | Unit testing |
| @testing-library/react | ^14.2.0 | Component testing |
| eslint | ^8.57.0 | Linting |
| prettier | ^3.2.0 | Code formatting |
| postcss | ^8.4.0 | CSS processing |
| autoprefixer | ^10.4.0 | Vendor prefixing |

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

| Layer | Directory | Description |
|-------|-----------|-------------|
| Pages | `src/pages/` | Top-level route components |
| Components | `src/components/` | Reusable UI components |
| Hooks | `src/hooks/` | Custom React hooks |
| Store | `src/store/` | Zustand state slices |
| Utils | `utils/` | Shared helper functions |
| Styles | `src/styles/` | Global CSS and Tailwind config |

---

## Database Schema

### `users` (managed by Supabase Auth)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | text | Unique |
| created_at | timestamptz | Auto |

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK → users.id |
| display_name | text | |
| avatar_url | text | Nullable |
| learning_style | text | visual / auditory / kinesthetic |
| sensory_preferences | jsonb | Font size, contrast, motion |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `courses`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | |
| description | text | |
| difficulty | text | beginner / intermediate / advanced |
| tags | text[] | Subject labels |
| created_at | timestamptz | Auto |

### `lessons`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| course_id | uuid | FK → courses.id |
| title | text | |
| content_type | text | text / audio / video / interactive |
| content_url | text | Nullable |
| content_body | text | Nullable |
| order_index | integer | |
| created_at | timestamptz | Auto |

### `progress`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id |
| lesson_id | uuid | FK → lessons.id |
| completed | boolean | Default false |
| score | integer | Nullable (0–100) |
| completed_at | timestamptz | Nullable |

---

## API Endpoints

All API access goes through the Supabase client library. The following operations are supported:

### Auth

| Operation | Method | Description |
|-----------|--------|-------------|
| Sign up | `supabase.auth.signUp()` | Create account with email/password |
| Sign in | `supabase.auth.signInWithPassword()` | Email/password login |
| Sign out | `supabase.auth.signOut()` | Invalidate session |
| OAuth | `supabase.auth.signInWithOAuth()` | Google / GitHub SSO |

### Profiles

| Operation | Table | Description |
|-----------|-------|-------------|
| Read profile | `profiles` SELECT | Fetch current user profile |
| Update profile | `profiles` UPDATE | Update learning preferences |

### Courses & Lessons

| Operation | Table | Description |
|-----------|-------|-------------|
| List courses | `courses` SELECT | Fetch all available courses |
| Get course | `courses` SELECT | Fetch single course by id |
| List lessons | `lessons` SELECT | Fetch lessons by course_id |
| Get lesson | `lessons` SELECT | Fetch single lesson |

### Progress

| Operation | Table | Description |
|-----------|-------|-------------|
| Get progress | `progress` SELECT | Fetch user progress |
| Mark complete | `progress` UPSERT | Mark lesson completed |

---

## Security

- All database access is mediated through **Row Level Security (RLS)** policies on Supabase
- Users can only read/write their own `profiles` and `progress` rows
- Environment secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) are loaded from `.env.local` and never committed
- The `anon` key is safe for client use; sensitive operations require server-side Edge Functions with the `service_role` key

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| First Contentful Paint | < 1.5 s |
| Time to Interactive | < 3.5 s |
| Bundle size (gzip) | < 200 KB initial |
