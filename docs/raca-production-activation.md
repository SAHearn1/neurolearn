# RACA Production Activation Runbook

**REQ-18-09 (#206)** — Enable the 5-layer RACA Cognitive Architecture in production.

## Pre-Flight Checklist

Before activating any RACA flags in Vercel, confirm the following:

- [ ] Migration 033 applied (`supabase db push` run on production)
- [ ] `ANTHROPIC_API_KEY` secret set in Supabase Edge Function secrets
- [ ] `RACA_AI_MODEL` secret set (default: `claude-sonnet-4-6`)
- [ ] Edge functions deployed (`supabase functions deploy agent-invoke epistemic-analyze`)
- [ ] RLS policies on `raca_artifacts`, `raca_agent_interactions`, `epistemic_profiles` verified active
- [ ] Rate limiting verified: agent-invoke allows 30 req/min, epistemic-analyze 20 req/min

---

## Activation Steps

Activate in this exact order. Deploy and smoke-test each layer before enabling the next.

### Step 1 — Runtime Layer

```
VITE_RACA_ENABLE_RUNTIME=true
```

**What activates:** Session lifecycle manager, Zustand runtime store, LEARNING.\* event bus, audit trail.

**Smoke test:** Open a lesson → Session page loads without errors → Check Supabase `cognitive_sessions` table has a new row → `audit_events` table receiving entries.

---

### Step 2 — Cognitive FSM + Guardrails + Audit

```
VITE_RACA_ENABLE_COGNITIVE_FSM=true
VITE_RACA_ENABLE_GUARDRAILS=true
VITE_RACA_ENABLE_AUDIT=true
```

**What activates:** 9-state machine (ROOT→ARCHIVE), state transition enforcement, constraint guardrails, Supabase audit persistence.

**Important:** Guardrails and audit MUST be enabled before agents (Step 3).

**Smoke test:** Session page shows ROOT state → Can advance through REGULATE → POSITION. State history visible in `cognitive_state_history` table.

---

### Step 3 — Agent Router + Agents

```
VITE_RACA_ENABLE_AGENT_ROUTER=true
VITE_RACA_ENABLE_AGENTS=true
```

**What activates:** State-to-agent mapping, AI agent invocations via `agent-invoke` Edge Function, server-side precondition enforcement (spec §X/XIV).

**Smoke test:** At REVISE state, submit a draft artifact → AI critique button becomes available → AI responds within 10s → `raca_agent_interactions` table shows logged interaction.

---

### Step 4 — Epistemic Monitoring + Adaptation

```
VITE_RACA_ENABLE_EPISTEMIC=true
VITE_RACA_ENABLE_ADAPTATION=true
```

**What activates:** TRACE fluency scoring (6 dimensions: Think, Reason, Articulate, Check, Extend, Ethical), LCP longitudinal profile, dysregulation detection, adaptive scaffolding difficulty.

**Smoke test:** Complete a full session → `epistemic_profiles` table updated with TRACE averages → Profile page shows Cognitive Growth section with dimension bars and trajectory badge.

---

## Vercel Dashboard Setup

1. Go to [Vercel Dashboard](https://vercel.com) → neurolearn project → **Settings** → **Environment Variables**
2. Add/update each variable for **Production** environment (not Preview or Development):

| Variable                         | Value  |
| -------------------------------- | ------ |
| `VITE_RACA_ENABLE_RUNTIME`       | `true` |
| `VITE_RACA_ENABLE_COGNITIVE_FSM` | `true` |
| `VITE_RACA_ENABLE_GUARDRAILS`    | `true` |
| `VITE_RACA_ENABLE_AUDIT`         | `true` |
| `VITE_RACA_ENABLE_AGENT_ROUTER`  | `true` |
| `VITE_RACA_ENABLE_AGENTS`        | `true` |
| `VITE_RACA_ENABLE_EPISTEMIC`     | `true` |
| `VITE_RACA_ENABLE_ADAPTATION`    | `true` |

3. Trigger a new deployment (push a commit or use **Redeploy** button).

---

## Rollback

To disable any layer, set the corresponding flag to `false` and redeploy. No data is lost — RACA state is stored in Supabase and is persistent across flag toggles.

To disable agents only (e.g., cost control):

```
VITE_RACA_ENABLE_AGENTS=false
```

Sessions will continue to function without AI agent responses — learners can still submit artifacts and progress through states.

---

## Emergency Kill Switch

Set ALL flags to `false` and redeploy. The app reverts to standard lesson-only mode. All historical session data is preserved in Supabase.

---

## Monitoring Post-Activation

- **Sentry**: Monitor for `agent-invoke` edge function errors and client-side RACA exceptions
- **Vercel Analytics**: Watch session duration increase (expected: RACA sessions are ~45–90 min)
- **Supabase**: Monitor `raca_agent_interactions` for elevated `blocked=true` rates (> 30% may indicate UX friction)
- **Anthropic Console**: Watch token usage and latency on `claude-sonnet-4-6`
