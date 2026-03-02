# NeuroLearn — Developer Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Code Conventions](#code-conventions)
4. [Key Code Snippets](#key-code-snippets)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/SAHearn1/neurolearn.git
cd neurolearn
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server (http://localhost:5173)
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run typecheck` | Run TypeScript compiler check |

---

## Architecture

### Directory Structure

```
src/
├── main.tsx              # React entry point
├── App.tsx               # Root component and router
├── components/
│   ├── ui/               # Generic reusable UI (Button, Card, Modal…)
│   ├── lesson/           # Lesson-specific components
│   └── dashboard/        # Dashboard widgets
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── CoursePage.tsx
│   ├── LessonPage.tsx
│   └── DashboardPage.tsx
├── hooks/
│   ├── useAuth.ts        # Authentication hook
│   ├── useCourses.ts     # Course data hook
│   └── useProgress.ts    # Progress tracking hook
├── store/
│   ├── authStore.ts      # Auth state (Zustand)
│   └── settingsStore.ts  # User preferences (Zustand)
└── styles/
    └── index.css         # Tailwind directives + global styles
```

### State Management

- **Zustand** stores handle global state (auth, preferences)
- **Supabase hooks** handle server state (courses, progress)
- Local component state is used for UI-only concerns (modals, form inputs)

---

## Code Conventions

- **TypeScript strict mode** is enabled — avoid `any`
- **Functional components** with hooks only (no class components)
- **Named exports** preferred over default exports for components
- File naming: `PascalCase` for components, `camelCase` for hooks and utils
- One component per file
- CSS via **Tailwind utility classes**; avoid inline styles
- Accessibility: all interactive elements must have accessible labels (`aria-label`, `aria-describedby`, visible focus rings)

---

## Key Code Snippets

### Supabase Client

```typescript
// utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Auth Hook

```typescript
// src/hooks/useAuth.ts
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../../utils/supabase/client'

export function useAuth() {
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [setUser])

  return { user }
}
```

### Zustand Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

### Fetching Courses

```typescript
// src/hooks/useCourses.ts
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .then(({ data }) => {
        if (data) setCourses(data)
        setLoading(false)
      })
  }, [])

  return { courses, loading }
}
```

---

## Current Scaffold Status

- Core scaffold files listed in `FILE_CHECKLIST.md` are complete.
- Baseline automated checks now include unit tests for helper and Zustand store behavior:
  - `utils/helpers.test.ts`
  - `src/store/authStore.test.ts`
  - `src/store/settingsStore.test.ts`
  - `src/store/progressStore.test.ts`

## Testing

CI executes `npm run test -- --run`, `npm run lint`, and `npm run build` via `.github/workflows/ci.yml`.

Tests live alongside source files as `*.test.tsx` / `*.test.ts`.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test:coverage
```

### Example Component Test

```typescript
// src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders button with label', () => {
  render(<Button>Start Learning</Button>)
  expect(screen.getByRole('button', { name: /start learning/i })).toBeInTheDocument()
})
```

---

## Troubleshooting

### `VITE_SUPABASE_URL is not defined`

Make sure you have copied `.env.example` to `.env.local` and filled in the Supabase project URL and anon key. Vite only exposes variables prefixed with `VITE_`.

### TypeScript errors after `npm install`

Run `npm run typecheck` to see all type errors. Common causes:

- Missing `@types/*` packages — install with `npm install -D @types/<package>`
- Incorrect `tsconfig.json` path aliases

### Tailwind classes not applying

Ensure `tailwind.config.js` `content` array includes all source files:

```js
content: ['./index.html', './src/**/*.{ts,tsx}']
```

### Supabase RLS blocking requests

Check that Row Level Security policies are set up correctly in the Supabase dashboard and that the user is authenticated before making requests.

---

## Security Practices

### Environment Variables

- All secrets go in `.env.local` (git-ignored)
- `.env.example` has placeholder keys — **never real values**
- Only `VITE_*` vars are bundled into the browser; server-only secrets must not use that prefix
- See [Technical Specs → Security](TECHNICAL_SPECS.md#security) for the full variable reference

### Vercel

- Production env vars are set in the Vercel dashboard (Settings → Environment Variables)
- Sensitive values (service role key, DB URL) are encrypted at rest
- Production URL: `https://neurolearn-one.vercel.app`
- Auto-deploys on push to `main` via GitHub integration

### Supabase

- `anon` key is safe for browser use — access is governed by RLS policies
- `service_role` key bypasses RLS — keep server-side only (Edge Functions)
- OAuth redirect URLs must be registered in Supabase Auth → URL Configuration
