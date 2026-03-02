# ADR-004: Security Model

## Status
Accepted (2026-03-02)

## Context
NeuroLearn handles student data (minors), requiring compliance with FERPA, COPPA, and GDPR. The security model must protect PII, prevent unauthorized access, and provide audit trails.

## Decision
- **Auth:** Supabase Auth (email/password, with password reset flow)
- **Authorization:** Row Level Security (RLS) on all Supabase tables — user-scoped access
- **RBAC:** 4 roles (learner, parent, educator, admin) via `user_role` enum on profiles table
- **Input Validation:** Zod schemas on all form inputs (client-side)
- **Output Sanitization:** HTML entity encoding for user-generated content
- **Security Headers:** CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Session Management:** Automatic token refresh 5 minutes before expiry
- **Audit Trail:** Immutable audit_log table (admin read-only) + RACA session audit events

## Security Headers (vercel.json)
- `Content-Security-Policy`: Restricts script/style/font/connect sources
- `Strict-Transport-Security`: HSTS with 2-year max-age and preload
- `X-Frame-Options: DENY`: Prevents clickjacking
- `Permissions-Policy`: Disables camera, microphone, geolocation, payment APIs

## Consequences
- All API keys stored in Supabase Edge Function secrets (never client-side)
- RLS ensures data isolation even if client-side code is compromised
- Service role key restricted to Edge Functions only
- Password requirements: 8+ chars, uppercase, lowercase, number (Zod enforced)
