# NeuroLearn — Gap Analysis & Execution Plan

Created: 2026-03-08
Updated: 2026-03-08
Status: All 8 gaps resolved in code/docs. GitHub issues #211–#218 closed.
Remaining: external secrets/config must be applied by operator (no code changes needed).

---

## Gap Summary

| ID     | Issue | Area               | Gap                                              | Severity | Code Status | Operator Action Needed                                |
| ------ | ----- | ------------------ | ------------------------------------------------ | -------- | ----------- | ----------------------------------------------------- |
| GAP-01 | #211  | Database           | Migrations 025–034 not applied to production     | CRITICAL | DONE        | `supabase db push` (auto via CI once GAP-03 done)     |
| GAP-02 | #212  | RACA Feature Flags | All 8 `VITE_RACA_ENABLE_*` flags off in prod     | CRITICAL | DONE        | Set 8 env vars in Vercel + redeploy                   |
| GAP-03 | #213  | CI/CD Secrets      | GitHub Actions missing Supabase secrets          | CRITICAL | DONE        | Add 3 secrets to GitHub Actions                       |
| GAP-04 | #214  | Error Tracking     | Sentry DSN not provisioned                       | HIGH     | DONE        | Create Sentry project, set DSN in Vercel              |
| GAP-05 | #215  | Lighthouse CI      | LHCI_GITHUB_APP_TOKEN not configured             | HIGH     | DONE        | Install LHCI GitHub App, add token secret             |
| GAP-06 | #216  | E2E Tests          | Playwright not running against live Supabase     | MEDIUM   | DONE        | Set `PLAYWRIGHT_RUN=true` var + E2E secrets in GitHub |
| GAP-07 | #217  | Staging QA         | Staging checklist not executed                   | MEDIUM   | DONE        | Execute `docs/staging-qa-checklist.md`                |
| GAP-08 | #218  | AI Provider Config | RACA_AI_PROVIDER / RACA_AI_MODEL not set in prod | MEDIUM   | DONE        | Set 3 secrets in Supabase Edge Functions              |

---

## Execution Plan

### Phase 19-A — Critical Infrastructure (unblocks everything)

**GAP-01: Apply production migrations**

```bash
# Requires SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD
supabase login
supabase db push --project-ref <SUPABASE_PROJECT_REF>
```

Migrations to apply: 025–034

- 025: Restrict role update
- 026: Lesson completion counters
- 027: Signup role from metadata
- 028: Soft-delete RLS filter
- 029: Immutable audit delete prevention
- 030: Content ownership + gap analysis fixes
- 031: Content moderation
- 032: RLS hardening and parent messages
- 033: RACA production indexes
- 034: Lessons RACA phase column

**GAP-02: Enable RACA feature flags in Vercel**

In Vercel dashboard → Project → Settings → Environment Variables (Production):

```
VITE_RACA_ENABLE_RUNTIME=true
VITE_RACA_ENABLE_COGNITIVE_FSM=true
VITE_RACA_ENABLE_AGENT_ROUTER=true
VITE_RACA_ENABLE_AGENTS=true
VITE_RACA_ENABLE_EPISTEMIC=true
VITE_RACA_ENABLE_GUARDRAILS=true
VITE_RACA_ENABLE_AUDIT=true
VITE_RACA_ENABLE_ADAPTATION=true
```

Also set AI provider config:

```
RACA_AI_PROVIDER=anthropic
RACA_AI_MODEL=claude-sonnet-4-6
```

Trigger a redeploy after setting vars.

**GAP-03: Add Supabase secrets to GitHub Actions**

In GitHub → repo Settings → Secrets and variables → Actions:

```
SUPABASE_PROJECT_REF    = <from Supabase dashboard>
SUPABASE_ACCESS_TOKEN   = <from Supabase account settings>
SUPABASE_DB_PASSWORD    = <from Supabase project settings>
```

This enables the CI `migrate` job to run `supabase db push` on every merge to `main`.

---

### Phase 19-B — Observability (high priority)

**GAP-04: Create Sentry project + configure DSN**

1. Create project at sentry.io (React platform)
2. Copy DSN from project settings
3. In Vercel env vars (Production + Preview):
   ```
   VITE_SENTRY_DSN=https://...@sentry.io/...
   VITE_SENTRY_ENVIRONMENT=production
   ```
4. In Vercel env vars (Preview):
   ```
   VITE_SENTRY_ENVIRONMENT=preview
   ```

**GAP-05: Configure Lighthouse CI token**

1. Install the Lighthouse CI GitHub App: https://github.com/apps/lighthouse-ci
2. Copy the token from the app setup
3. In GitHub Actions secrets:
   ```
   LHCI_GITHUB_APP_TOKEN = <token>
   ```

---

### Phase 19-C — QA & Testing (medium priority)

**GAP-06: Enable Playwright E2E**

Requires a running Supabase instance (staging or production). When ready:

1. Set env vars for test runner:
   ```
   PLAYWRIGHT_RUN=true
   VITE_SUPABASE_URL=<staging url>
   VITE_SUPABASE_ANON_KEY=<staging anon key>
   ```
2. Create test user accounts (learner, educator, parent, admin roles)
3. Run: `npm run test:e2e`

Test files:

- `tests/e2e/auth.spec.ts` — auth flows
- `tests/e2e/smoke.spec.ts` — page load smoke tests
- `tests/e2e/educator-portal.spec.ts` — class management flows
- `tests/e2e/lesson.spec.ts` — lesson completion flow
- `tests/e2e/parent-portal.spec.ts` — parent portal flows

**GAP-07: Execute staging QA checklist**

Reference: `docs/environment-management.md` staging checklist.

Key areas to verify:

- Auth flows (signup with age gate, login, password reset)
- RACA session start-to-archive with all 5 agents
- TRACE scoring and XP multiplier display
- Educator LCP dashboard with student data
- Parent growth narrative view
- Regulation intervention content rendering
- Session history timeline
- Voice input (Web Speech API — Chrome/Edge only)
- Onboarding first-run flow (clear localStorage to re-trigger)
- Deep work streak counter

---

## Dependency Order

```
GAP-03 (GitHub secrets)
    └── enables automated GAP-01 on CI
GAP-01 (DB migrations) ──┐
GAP-02 (feature flags)  ──┼── enables RACA features in production
GAP-08 (AI provider)    ──┘
GAP-04 (Sentry)         ── independent
GAP-05 (LHCI token)     ── independent
GAP-06 (E2E tests)      ── needs GAP-01 + working Supabase instance
GAP-07 (staging QA)     ── needs GAP-01 + GAP-02 + GAP-08
```

## Recommended Execution Order

1. GAP-03 → sets up GitHub secrets (5 min)
2. GAP-01 → apply production DB migrations (10 min, verify with `supabase db status`)
3. GAP-02 + GAP-08 → set Vercel env vars + redeploy (10 min)
4. GAP-04 → Sentry DSN (15 min to create project)
5. GAP-05 → LHCI token (5 min)
6. GAP-07 → QA checklist against production (30–60 min)
7. GAP-06 → E2E against staging (run `npm run test:e2e` locally or in CI)
