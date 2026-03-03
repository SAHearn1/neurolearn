# ADR-001: Framework and Infrastructure Selection

## Status

Accepted (2026-03-02)

## Context

NeuroLearn is a multimodal learning platform for neurodivergent learners requiring real-time data, authentication, adaptive content, and accessibility-first design. We needed to select a frontend framework, backend/database platform, state management, and deployment strategy.

## Decision

- **Frontend:** React 18 + TypeScript + Vite (SPA architecture)
- **Backend/DB:** Supabase (PostgreSQL, Auth, Edge Functions, Realtime, Storage)
- **State Management:** Zustand (client state) + Supabase hooks (server state)
- **Styling:** Tailwind CSS 3 with custom brand palette
- **Routing:** React Router v6 (client-side)
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel (automatic preview/production deployments)
- **AI Integration:** Anthropic Claude via Supabase Edge Functions

## Rationale

- React 18 provides Suspense and lazy loading for code splitting
- Supabase gives us PostgreSQL (with RLS), auth, and Edge Functions in one platform — no separate backend server needed
- Zustand is lightweight (< 1KB) and pairs well with Supabase's real-time subscriptions
- Vite provides fast HMR and optimized builds
- Vercel provides zero-config deployment with preview URLs for every PR

## Consequences

- SPA requires client-side routing and SSR is not available
- Supabase vendor dependency for auth, database, and serverless functions
- Edge Functions run on Deno, not Node.js
