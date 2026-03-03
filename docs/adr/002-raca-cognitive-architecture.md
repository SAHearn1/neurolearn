# ADR-002: RACA (RootWork Agentic Cognitive Architecture)

## Status

Accepted (2026-03-02)

## Context

NeuroLearn requires a structured learning system that prevents AI from collapsing the reasoning process for learners. The system must enforce the RootWork 5Rs methodology as structural learning phases and embed TRACE as a cognitive monitoring cycle.

## Decision

Implement a 5-layer agentic cognitive architecture:

- **Layer 0 — Runtime Authority:** Session state, events, artifacts, audit trail (Zustand + reducer pattern)
- **Layer 1 — Cognitive State Machine:** 9 states (ROOT through ARCHIVE) with preconditions and transition guards
- **Layer 2 — Agent Router:** State-to-agent mapping with permission enforcement
- **Layer 3 — Role-Constrained Agents:** 5 agents (Framing, Research, Construction, Critique, Defense) with strict output contracts
- **Layer 4 — Epistemic Monitoring:** TRACE fluency tracking, dysregulation detection, adaptive scaffolding

## Key Constraint

Only learner actions can trigger forward state transitions. AI agents cannot advance the cognitive process — they can only scaffold the learner's thinking within their current state.

## Rationale

- Prevents "AI shortcut" behavior where models provide answers instead of scaffolding thinking
- Enforces pedagogical soundness via state machine preconditions
- Feature flags allow progressive rollout of each layer independently
- Audit trail provides full observability of every session interaction

## Consequences

- Additional 93 files in src/lib/raca/
- Feature flags required for all RACA functionality
- Edge Functions needed for AI agent invocation (server-side API keys)
- Session state must be persisted both locally and to Supabase
