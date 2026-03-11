# Intellectual Property Documentation

# RootWork Agentic Cognitive Architecture (RACA)

**Owner:** Dr. Shawn Hearn / SAHearn1
**Project:** NeuroLearn
**First Conception:** 2026-02-01
**Reduction to Practice:** 2026-03-02 (ADR-002 accepted; implementation complete)
**Classification:** Proprietary — Trade Secret / Patent-Pending Candidate
**Document Version:** 1.0 (2026-03-11)

---

## 1. Summary of the Invention

RACA is a **5-layer software architecture for AI-mediated learning** that enforces a structured cognitive sequence on a learner while constraining AI agents to scaffolding roles only. It is the first known architecture to:

1. Encode a pedagogical framework (RootWork 5Rs) directly as a finite state machine
2. Bind AI agent permissions to cognitive states — not to user roles or content types
3. Prevent AI from advancing a learner's cognitive progress (only learner actions can trigger forward state transitions)
4. Produce a structured, multi-dimensional evidence record (TRACE) from every conversational exchange

---

## 2. Architecture Overview

RACA is composed of five layers, each with a single, non-overlapping responsibility:

### Layer 0 — Runtime Authority

- Manages session lifecycle (start, pause, end, resume)
- Maintains an append-only audit trail of every learner action and agent response
- Owns the Zustand runtime store; all other layers read state from Layer 0, never write to it directly
- Enforces session preconditions before any agent invocation

### Layer 1 — Cognitive Finite State Machine (FSM)

- Implements a 9-state machine: `ROOT → REGULATE → POSITION → PLAN → APPLY → REVISE → DEFEND → RECONNECT → ARCHIVE`
- Each state has typed entry conditions, exit conditions, and transition guards
- Forward transitions are gated — a learner must produce a qualifying artifact or action to advance
- Backward transitions (regression) are permitted and logged as diagnostic signals
- **Novel element:** The state sequence maps directly to the RootWork 5Rs framework (Relate, Regulate, Reason, Repair, Restore), encoding pedagogy as executable logic rather than as instructional text

### Layer 2 — Agent Router

- A deterministic mapping from cognitive state → permitted agent(s)
- No agent can be invoked outside its permitted states
- Enforces the principle that AI cannot "skip ahead" — the router rejects out-of-state invocations at the server side (Supabase Edge Function precondition check)
- **Novel element:** Permission is granted to agents by cognitive state, not by user identity or content category — a structurally distinct authorization model

### Layer 3 — Role-Constrained Agents

- Five agents with strict output contracts: Socratic, Feedback, Research, Synthesis, Reflection
- Each agent receives an `AgentContext` that includes: current RACA state, TRACE fluency profile, prior session outcome, CCSS standards in scope, and adaptive difficulty level
- Every agent prompt injects three directives at inference time: `traceFocusDirective` (weakest TRACE dimension), `ccssDirective` (standards in scope), `priorOutcomeDirective` (last session mastery outcome)
- Agents are implemented as Claude API calls (claude-sonnet-4-6) with role-specific system prompts that cannot be overridden at runtime
- **Novel element:** Agent context is dynamically assembled from live learner data (TRACE profile, mastery score, regulation level) on every invocation, making each agent call a personalised inference rather than a static prompt

### Layer 4 — Epistemic Monitor

- Scores every learner artifact against the TRACE framework: **Think, Reason, Articulate, Check, Extend, Ethical** (6 dimensions, 0–10 each)
- Detects dysregulation signals from regulation check-in data and response latency patterns
- Aggregates a Learner Cognitive Profile (LCP) across sessions, stored in `epistemic_profiles`
- Bridges TRACE evidence to CCSS standards via `student_ccss_evidence` — every session generates standards-aligned evidence records
- **Novel element:** The Ethical dimension (added 2026-03-05) scores the learner's reasoning for ethical awareness and consideration of impact — not present in any known prior TRACE implementation

---

## 3. Novel Elements and Differentiation from Prior Art

| Claim                                                | Prior Art                                         | RACA Differentiation                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| AI tutoring systems                                  | Provide answers, hints, or explanations directly  | RACA agents are structurally prohibited from answer-giving; scaffolding is the only permitted output        |
| Adaptive learning platforms (Khan Academy, Duolingo) | Adapt difficulty based on response correctness    | RACA adapts based on cognitive state, TRACE fluency profile, and regulation level — not correctness alone   |
| Conversational AI tutors (Khanmigo, etc.)            | Single AI agent with a broad persona              | RACA uses 5 state-gated agents; no single agent has full-session authority                                  |
| Learning management systems                          | Track completion and scores                       | RACA produces a multi-dimensional TRACE artifact record per session, bridged to standards evidence          |
| Cognitive scaffolding frameworks                     | Defined as instructional text or teacher practice | RACA encodes scaffolding as a finite state machine with enforced preconditions — the pedagogy is executable |

---

## 4. Implementation Components

All components are implemented in the `neurolearn` repository under `src/lib/raca/`:

| Component          | Path                                       | Description                                                      |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| Runtime store      | `layer0-runtime/`                          | Zustand store, audit buffer, session lifecycle                   |
| Cognitive FSM      | `layer1-cognitive-fsm/`                    | State definitions, transition guards, state types                |
| Agent router       | `layer2-agent-router/`                     | State-to-agent mapping, permission enforcement                   |
| Agent prompts      | `layer3-agents/prompt-templates.ts`        | Role-constrained system prompts with dynamic directive injection |
| Adaptation scripts | `layer3-agents/adaptation-scripts.ts`      | Runtime personalisation scripts per agent                        |
| TRACE scoring      | `layer4-epistemic/`                        | Fluency scoring, LCP aggregation, dysregulation detection        |
| Mastery scorer     | `src/lib/intelligence/mastery-scorer.ts`   | Artifact-kind weighted scoring with TRACE minimum thresholds     |
| Server enforcement | `supabase/functions/agent-invoke/index.ts` | Server-side precondition check before any Claude API call        |

---

## 5. Database Schema (Proprietary)

The following tables implement the RACA evidence model:

- `cognitive_sessions` — session records with mode, state sequence, duration
- `raca_artifacts` — immutable learner artifacts per session (append-only trigger)
- `raca_audit_events` — full audit trail, RLS-protected
- `epistemic_profiles` — per-learner LCP with TRACE dimension scores
- `skill_evidence_events` — artifact-to-skill linkage
- `student_ccss_evidence` — standards-aligned evidence records
- `mastery_cooldowns` — 24-hour cooldown enforcement after failed mastery checks
- `regulation_checkins` — emotional and formative check-in records

---

## 6. Pedagogical Foundation

RACA is the technical implementation of the **RootWork 5Rs Framework**, developed by Dr. Shawn Hearn:

| 5Rs Phase | RACA States         | Role                                                    |
| --------- | ------------------- | ------------------------------------------------------- |
| Relate    | ROOT                | Session grounding and context-setting                   |
| Regulate  | REGULATE            | Emotional readiness check before cognitive work begins  |
| Reason    | POSITION → APPLY    | Core thinking sequence: positioning, planning, applying |
| Repair    | REVISE → DEFEND     | Error detection, revision, and defended reasoning       |
| Restore   | RECONNECT → ARCHIVE | Metacognitive reflection and evidence archiving         |

The mapping of 5Rs to FSM states is the core pedagogical claim of this IP. The FSM does not merely sequence activities — it enforces the _conditions_ under which each phase of reasoning is appropriate, making the pedagogy structurally binding rather than advisory.

---

## 7. Confidentiality and Use Restrictions

This document describes proprietary architecture owned by Dr. Shawn Hearn. The architecture, its layer structure, agent permission model, TRACE scoring system, and 5Rs-to-FSM mapping are trade secrets. Disclosure to third parties requires written authorisation from the owner.

Nothing in this document constitutes a public disclosure for patent purposes.
