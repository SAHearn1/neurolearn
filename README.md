# NeuroLearn

**NeuroLearn** is a multimodal learning app designed to support neurodivergent learners with adaptive, accessible, and personalized educational experiences.

---

## 🧠 Project Overview

NeuroLearn combines visual, auditory, and kinesthetic learning pathways to help users with ADHD, dyslexia, autism spectrum conditions, and other learning differences thrive in their educational journeys.

## ✨ Features

- 🎨 **Multimodal Content Delivery** — Text, audio, video, and interactive exercises
- 🔄 **Adaptive Learning Paths** — AI-driven curriculum that adjusts to learning pace and style
- ♿ **Accessibility First** — WCAG 2.1 AA compliant with screen reader support
- 👤 **User Profiles** — Customizable settings for sensory preferences and learning modes
- 📊 **Progress Tracking** — Visual dashboards and milestone celebrations
- 🔔 **Smart Reminders** — Gentle, customizable notifications with break suggestions
- 🌙 **Focus Mode** — Distraction-free reading and task completion
- 🤝 **Parent / Educator Portal** — Collaborative oversight and progress sharing

## 🛠 Tech Stack

| Layer        | Technology                           |
| ------------ | ------------------------------------ |
| Frontend     | React 18, TypeScript, Vite           |
| Styling      | Tailwind CSS, PostCSS                |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage) |
| State        | Zustand                              |
| Routing      | React Router v6                      |
| Testing      | Vitest, React Testing Library        |
| Linting      | ESLint, Prettier                     |
| Deployment   | Vercel / Netlify                     |

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SAHearn1/neurolearn.git
cd neurolearn

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local
# Fill in your Supabase project URL and anon key

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
neurolearn/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.mjs
├── src/
│   ├── main.tsx          # App entry point
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   └── styles/
├── supabase/
│   └── migrations/
└── utils/
    └── supabase/
        └── info.tsx
```

## 📖 Documentation

- [Setup Guide](SETUP_GUIDE.md) — Step-by-step local environment setup
- [Developer Guide](DEVELOPER_GUIDE.md) — Architecture, code conventions, and snippets
- [Technical Specs](TECHNICAL_SPECS.md) — Dependencies, DB schema, API endpoints
- [Contributing](CONTRIBUTING.md) — How to contribute, code of conduct
- [Changelog](CHANGELOG.md) — Version history
- [Issue Progress Log](ISSUE_PROGRESS.md) — Completed workstreams and next issue queue

## ✅ Implementation Status

The scaffold backlog in `FILE_CHECKLIST.md` is now fully completed (83/83 files).
Current implementation includes:

- Route-based app navigation and nested layout shell (`Header`, `Sidebar`, `Footer`, `FocusMode`)
- Core pages for home/auth/dashboard/courses/lesson/profile/settings/404
- Reusable UI primitives under `src/components/ui`
- Lesson and dashboard component modules under `src/components/lesson` and `src/components/dashboard`
- Initial hooks, Zustand stores, shared types, Supabase helpers, and starter SQL migrations/seed
- Hooks now support Supabase-backed reads/writes with local fallback when env is not configured
- Issue tracking and sequencing are maintained in `ISSUE_PROGRESS.md`

## 🗺 Roadmap

- [x] Project scaffold and documentation
- [x] Authentication (Supabase Auth)
- [x] User profiles and learning preferences
- [x] Core lesson components (text, audio, interactive)
- [x] Adaptive learning algorithm (RACA 5-layer architecture)
- [x] Progress dashboard
- [x] Educator / parent portal
- [x] Mobile-responsive design
- [x] Accessibility audit and fixes
- [ ] v1.0 release

## 🔒 Supabase Security Guardrails

These rules are **mandatory** for all contributors and must be enforced in code review.

### Service Role Key
- The **service role key** (`SUPABASE_SERVICE_ROLE_KEY`) bypasses Row Level Security.
- It must **never** be included in the client bundle (`src/`, `public/`).
- It is only permitted in Vercel serverless functions or other server-side runtimes.
- `utils/supabase/server.ts` is a placeholder for future SSR use — never import it from client components.

### Admin Role Assignment
- Users cannot self-assign `role = 'admin'` via the signup form.
  Migration `027_signup_role_from_metadata.sql` enforces this at the DB trigger level.
- Admin promotion must be done manually in the Supabase dashboard or via a
  server-side function using the service role key.

### Redirect Allowlist
- All auth redirect URLs (password reset, OAuth callbacks) must be listed in:
  - `supabase/config.toml` → `additional_redirect_urls` (local dev)
  - Supabase dashboard → **Authentication → URL Configuration** (production)
- Never trust user-supplied redirect parameters without validation.

### Developer Checklist (pre-merge)
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` reference in `src/` or `public/`
- [ ] No `import … from 'utils/supabase/server'` in client components
- [ ] New auth redirect URLs added to both `config.toml` and Supabase dashboard
- [ ] New user-facing roles validated in `handle_new_user()` trigger
- [ ] RLS policies reviewed for any new tables

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

_NeuroLearn — learning that adapts to you._
