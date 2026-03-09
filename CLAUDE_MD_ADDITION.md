
---

## Phase 19–20: Agentic Intelligence Engine + Pedagogical Systems

> This section briefed you on the RootWork Framework and what Phase 19–20 is building.
> Read this entire section before touching any code in this phase.

### Platform Purpose (Full Context)

NeuroLearn is not an LMS. It is an **agentic AI learning engine** grounded in the RootWork Framework. It:

- Continuously monitors regulatory state and learning readiness
- Runs a **diagnostic → formative → summative loop** that never stops
- Prescribes **micro-learning paths** based on detected conceptual gaps
- Aligns to **Common Core Standards invisibly** (students never feel "tested")
- Gives students **agency and mastery-based progression** — no fixed pace, no seat-time gates
- Surfaces **TRACE fluency, epistemic state, frustration level, and regulatory state** to educators in real time

### The RootWork Framework (5Rs)

Every AI agent prompt, every DB schema decision, every UI component must be anchored to these principles:

| R | Phase | What it means in code |
|---|-------|----------------------|
| **Root** | Grounding | Session entry: connect to prior knowledge via diagnostic gate (AI-01) |
| **Regulate** | Regulatory readiness | Check-in widget + frustration detector + availability detector (AI-03, AI-08) |
| **Reflect** | Epistemic positioning | POSITION + PLAN states — framing-agent and research-agent |
| **Restore** | Consolidation | REVISE + DEFEND + ARCHIVE states — mastery evaluation (AI-05) |
| **Reconnect** | Integration | Cross-session memory + gap prescription + spaced repetition (AI-02, AI-09, ASS-02) |

### TRACE Epistemic Fluency (6 Dimensions)

TRACE is the cognitive measurement system. The fluency-tracker.ts is **operational**. These weights must sum to 1.0 — do not change without discussion:

```
think=0.12, reason=0.20, articulate=0.17, check=0.17, extend=0.17, ethical=0.17
```

When personalizing agent prompts (AI-07), identify the **lowest scoring dimension** and inject a targeted probe directive. Examples:
- Low `articulate` (< 4): "Ask the learner to explain in more detail, using complete sentences"
- Low `extend` (< 3): "Probe for connections — ask how this relates to something they already know"
- Low `check` (< 3): "Challenge an assumption — ask 'Are you sure about that? How do you know?'"
- Low `reason` (< 4): "Ask for explicit reasoning — 'Because...', 'Therefore...', 'The evidence shows...'"

### The RACA 9-State Architecture

```
ROOT → REGULATE → POSITION → PLAN → APPLY → REVISE → DEFEND → RECONNECT → ARCHIVE
```

Backward transitions (dysregulation) are valid from any state → REGULATE when `regulation.level < 40`.

The current issue: **layers are built but not connected**. Specifically:
- `availability-detector.ts` — written, **never called** → fix in AI-08
- `ARCHIVE` state fires but **triggers nothing** → fix in AI-02, AI-05
- `adaptive_learning_state.strengths[]` and `weaknesses[]` are **always empty** → fix in AI-04, AI-02
- `ParentGrowthNarrative.tsx` — component shell, **fetches nothing** → fix in PAR-05
- Agent prompts receive rich context but **none of it is injected** into prompt text → fix in AI-07

### AI Persona: Amara

The AI guide persona across all 6 agents is **Amara** (aligned with Dr. Amara Keyes, the RWFW AI avatar).
Base persona:
```
You are Amara, a warm and intellectually curious learning guide. You believe every learner
is capable of deep thinking. You are patient, specific, and always honest. You use the
learner's first name. You never use clinical, evaluative, or test-oriented language.
You are a thinking partner, not a grader.
```
Per-agent voice addenda are defined in AI-07. **Always use `learner_first_name` from profile.**

### Critical Invariants — Never Violate

1. **Never produce diagnostic labels.** The `adaptation-engine.ts` comment says it explicitly. The system adjusts support levels. It never labels learners as anything.
2. **RLS on every new table.** See `016_rls_policies.sql` as the pattern. Every `CREATE TABLE` must be followed by `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and appropriate policies.
3. **Migration sequence starts at 021.** Current migrations go to 020. Number sequentially: 021, 022, 023...
4. **TRACE weights must sum to 1.0.** Do not adjust without discussion.
5. **GALS Foundation ≠ GALs (Guardians ad Litem).** These are different entities. Never conflate in any string, comment, or UI copy.
6. **Amara never grades or evaluates in clinical terms.** She notices, wonders, asks, and encourages.

### Issue Manifest

All Phase 19–20 issues are defined in `docs/PHASE_19_20_ISSUES.json`.
Each issue contains: `id`, `title`, `priority`, `layer`, `phase`, `depends_on[]`, `files[]`, `new_files[]`, `body`.

**Dependency order is critical.** Build in this sequence:

```
AI-06 → AI-04 → AI-05 → AI-02   (skill taxonomy must exist before evidence, evidence before mastery, mastery before gaps)
AI-03 → AI-08                     (regulation check-in before availability detector)
AI-06 → AI-01 → AI-07             (taxonomy before diagnostic gate before personalized prompts)
AI-05 → AI-09                     (mastery scoring before cross-session memory)
CCSS-01 → CCSS-02 → CCSS-03      (schema before views before student UX)
AI-03 → EDU-13 → EDU-14          (frustration data before dashboard before alerts)
```

### Session Exit Checklist

Before ending any Phase 19–20 session, you MUST:
1. `npm run lint && npm run typecheck && npm run build` — 0 errors.
2. `npm run test` — all tests passing.
3. Append entry to `docs/INCIDENTS.md` for any bugs resolved.
4. Update `ISSUE_PROGRESS.md` with completed issue IDs and new issue numbers.
5. List any blockers or unresolved decisions as a comment at the bottom of this section.
