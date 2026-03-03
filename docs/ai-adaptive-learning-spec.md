# AI-Powered Adaptive Learning Specification

## Overview

NeuroLearn's adaptive learning engine uses AI (Claude/Gemini) to provide personalized learning recommendations while respecting the RACA cognitive architecture constraints. The engine operates at two levels:

1. **Session-level**: Real-time adjustments during a learning session (difficulty, scaffolding, agent behavior)
2. **Longitudinal**: Cross-session pattern recognition and curriculum path optimization

## Architecture

```
┌─────────────────────────────────────────┐
│         Adaptive Learning Engine         │
├──────────────┬──────────────────────────┤
│  Difficulty  │  Recommendation Engine   │
│  Adjuster    │  (next lesson, review)   │
├──────────────┼──────────────────────────┤
│  Learning    │  Accommodation           │
│  Velocity    │  Optimizer               │
│  Tracker     │                          │
└──────────────┴──────────────────────────┘
        ↕                    ↕
┌────────────────┐  ┌──────────────────────┐
│ adaptive_      │  │ epistemic_profiles   │
│ learning_state │  │ (from RACA Layer 4)  │
└────────────────┘  └──────────────────────┘
```

## Components

### 1. Difficulty Adjuster

Adjusts lesson difficulty based on performance signals:

| Signal                       | Weight | Source                             |
| ---------------------------- | ------ | ---------------------------------- |
| Lesson completion rate       | 30%    | lesson_progress                    |
| Time-to-complete vs expected | 20%    | lesson_progress.time_spent_seconds |
| Quiz/assessment scores       | 25%    | lesson_progress.score              |
| Revision frequency (RACA)    | 15%    | epistemic_profiles                 |
| Streak consistency           | 10%    | profiles.streak_days               |

**Difficulty levels**: easy → medium → hard → adaptive

**Rules**:

- Promote after 3 consecutive scores >= 80%
- Demote after 2 consecutive scores < 50%
- "Adaptive" mode: AI selects difficulty per-question

### 2. Recommendation Engine

Recommends next learning content:

- **Primary signal**: Learning velocity (lessons/week trend)
- **Secondary signals**: Strengths/weaknesses arrays, mastery scores
- **Constraint**: Never recommend content requiring prerequisites not yet completed
- **Output**: `recommended_lesson_id` stored in `adaptive_learning_state`

### 3. Learning Velocity Tracker

Computes rolling average of learning pace:

```
velocity = completed_lessons_last_14_days / 14
trend = current_velocity - previous_velocity
```

Used to:

- Adjust reminder frequency (slower velocity → more encouragement)
- Calibrate break suggestions (high velocity → more break prompts)
- Inform educator dashboards

### 4. Accommodation Optimizer

Adapts presentation based on accessibility preferences and learning patterns:

| Pattern Detected             | Accommodation                               |
| ---------------------------- | ------------------------------------------- |
| Slow reading speed           | Increase text size, reduce paragraph length |
| Frequent re-reads            | Add summaries, highlight key terms          |
| Low quiz scores after video  | Offer text alternative                      |
| High RACA revision frequency | More scaffolded prompts                     |
| Dysregulation signals        | Pause content, offer regulation exercise    |

## AI Integration Points

### Edge Function: `/api/adaptive-recommend`

**Input**: user_id, course_id, recent_performance
**Output**: recommended_lesson_id, difficulty_adjustment, accommodation_hints

**AI Provider**: Configurable via `RACA_AI_PROVIDER` / `RACA_AI_MODEL`

**Prompt template**:

```
You are an adaptive learning assistant for a neurodivergent learner.
Given their performance data, recommend the optimal next lesson and
any accommodations. Never label or diagnose the learner.

Performance: {performance_json}
Available lessons: {lesson_list}
Current accommodations: {accommodation_prefs}
```

### Guardrails

1. AI never assigns diagnostic labels
2. AI never skips prerequisite content
3. AI never reduces challenge below "easy" — only increases scaffolding
4. All recommendations are logged to audit trail
5. Educator can override any AI recommendation

## Database Tables

Uses existing `adaptive_learning_state` table (migration 007):

- `current_difficulty`, `mastery_score`, `recommended_lesson_id`
- `learning_velocity`, `strengths[]`, `weaknesses[]`

## Feature Flag

`VITE_RACA_ENABLE_ADAPTATION=true` activates the engine.
When disabled, the system uses static lesson ordering.
