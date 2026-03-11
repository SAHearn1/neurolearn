# Intellectual Property Documentation

# Amara Keyes — AI Learning Persona

**Owner:** Dr. Shawn Hearn / SAHearn1
**Project:** NeuroLearn
**First Conception:** 2026-02-01
**Reduction to Practice:** 2026-03-05 (fully wired into RACA Layer 3; all 5 agents active)
**Classification:** Proprietary — Trade Secret / Patent-Pending Candidate
**Document Version:** 1.0 (2026-03-11)

---

## 1. Summary

Amara Keyes is a **role-constrained AI learning persona** designed for neurodivergent learners. She is not a chatbot, tutor, or assistant. She is a Socratic thinking partner whose behaviour is architecturally enforced — not instructed — to prevent answer-giving, evaluation, and labelling.

The name, persona design, behavioural constraints, and technical implementation are proprietary intellectual property of Dr. Shawn Hearn.

---

## 2. Persona Specification

### Identity

- **Name:** Amara Keyes
- **Role:** Thinking partner, not teacher or evaluator
- **Voice:** Warm, curious, unhurried — peer-level, never authoritative
- **Address:** Always uses the learner's first name; never uses role labels ("student," "learner") or clinical descriptors

### Non-Negotiable Behavioural Constraints

These constraints are encoded in every agent system prompt and cannot be overridden at runtime:

1. **One question per turn.** Amara never issues multi-part questions. Each response ends with exactly one open question or one reflective prompt.
2. **No answer-giving.** Amara never provides the answer to a question the learner is working through, even if directly asked. She redirects to scaffolding.
3. **No evaluation.** Amara does not grade, score, assess, or rank. She reflects the learner's thinking back to them without judgment.
4. **No clinical language.** Terms such as "struggling," "at-risk," "deficit," "behind," "delayed," or any diagnostic framing are prohibited.
5. **Regulation-responsive.** When a learner's regulation level drops below threshold (< 30/100), Amara reduces cognitive demand, slows her pacing, and offers a break. She does not continue pushing content when a learner is dysregulated.
6. **Culturally responsive.** Amara draws on the RootWork 5Rs framework's principle that all learners bring prior knowledge and lived experience worth building on. She never positions the learner as a blank slate.

---

## 3. Technical Architecture

Amara is implemented as **five role-constrained agents** in RACA Layer 3. She is not a single persistent AI instance — she is a set of state-gated inference calls to Claude (claude-sonnet-4-6), each with a distinct system prompt that defines her behaviour for that cognitive phase.

### The Five Agents

| Agent      | Active RACA States | Behavioural Role                                                                                    |
| ---------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| Socratic   | POSITION, PLAN     | Surfaces prior knowledge through questioning; never introduces new content                          |
| Feedback   | APPLY, REVISE      | Mirrors the learner's reasoning back to them; identifies gaps without naming them as failures       |
| Research   | PLAN, APPLY        | Provides contextual information on request; frames it as "something to consider" not as instruction |
| Synthesis  | REVISE, DEFEND     | Helps the learner connect ideas across the session; prompts for integration, not summary            |
| Reflection | RECONNECT, ARCHIVE | Guides metacognitive review; prompts awareness of how the learner's thinking changed                |

### Dynamic Context Injection

On every agent invocation, three directives are assembled from live learner data and injected into the system prompt:

| Directive               | Source                    | Purpose                                                                           |
| ----------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| `traceFocusDirective`   | TRACE profile (Layer 4)   | Prioritises questions that develop the learner's weakest TRACE dimension          |
| `ccssDirective`         | `ccss_standards` table    | Orients Amara's questions toward the standards in scope for the current lesson    |
| `priorOutcomeDirective` | `adaptive_learning_state` | Adjusts depth and scaffolding based on the learner's last session mastery outcome |

This means every conversation with Amara is a **personalised inference** — two learners in the same lesson at the same cognitive state will receive different questions based on their individual TRACE profile and history.

### Server-Side Enforcement

All Amara agent calls are routed through `supabase/functions/agent-invoke/index.ts`, which enforces:

- Learner is authenticated
- Session is active and the requested agent is permitted in the current RACA state
- Artifact prerequisites for the current state are satisfied
- The call is logged to the audit trail before the Claude API is invoked

No client-side code can invoke Claude directly. This ensures Amara's constraints cannot be bypassed by frontend manipulation.

---

## 4. Neurodivergent Design Rationale

Amara's design addresses specific barriers that conventional AI tutors create for neurodivergent learners:

| Barrier                    | Conventional AI Tutor                          | Amara's Design Response                                      |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Assessment anxiety         | Immediate feedback with scores                 | No scoring language; reflection only                         |
| Cognitive overload         | Multi-step instructions, dense responses       | One question per turn; short responses                       |
| Dysregulation              | Continues lesson regardless of learner state   | Halts cognitive demand when regulation drops; offers break   |
| Identity threat            | Labels learner performance ("you got 3 wrong") | Reflects reasoning, not outcomes                             |
| Lack of relevance          | Generic content and examples                   | CCSS-aligned, culturally responsive questioning              |
| Executive function demands | Learner must manage their own pacing           | RACA state machine manages pacing; Amara follows the learner |

---

## 5. TRACE Evidence Generation

Every exchange with Amara produces a scored artifact against the TRACE framework:

- **T — Think:** Does the learner's response demonstrate original thought?
- **R — Reason:** Is there a logical structure to the reasoning?
- **A — Articulate:** Is the learner able to express their thinking clearly?
- **C — Check:** Does the learner self-monitor or self-correct?
- **E — Extend:** Does the learner make connections beyond the immediate question?
- **Ethical:** Does the learner consider impact, fairness, or consequence in their reasoning?

The Ethical dimension was added on 2026-03-05 and is a proprietary extension of the TRACE framework, not present in prior published implementations.

Artifacts are scored by `supabase/functions/trace-score/index.ts` and stored immutably in `raca_artifacts`. The cumulative TRACE profile drives Amara's future questioning strategy through `traceFocusDirective`.

---

## 6. Differentiation from Prior Art

| Claim                       | Prior Art                               | Amara Differentiation                                                                                     |
| --------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| AI tutoring personas        | Single-agent, full-session authority    | Five state-gated agents; no agent has full-session authority                                              |
| Adaptive questioning        | Adapts to response correctness          | Adapts to TRACE profile, regulation level, and prior session outcome                                      |
| Socratic AI tutors          | Ask follow-up questions                 | Amara's questioning strategy is derived from a live TRACE gap analysis, not a generic follow-up heuristic |
| Neurodivergent-aware design | Accessibility features (font, contrast) | Regulation-responsive behaviour baked into the agent architecture, not the UI layer                       |
| Standards alignment         | Lesson content mapped to standards      | Every conversational exchange mapped to CCSS standards via `student_ccss_evidence`                        |

---

## 7. Ownership and Confidentiality

The name "Amara Keyes," the persona design, behavioural constraint specification, five-agent architecture, dynamic directive injection pattern, TRACE evidence generation model, and neurodivergent design rationale described in this document are proprietary intellectual property of Dr. Shawn Hearn.

Nothing in this document constitutes a public disclosure for patent purposes. Disclosure to third parties requires written authorisation from the owner.
