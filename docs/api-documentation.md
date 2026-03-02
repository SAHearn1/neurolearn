# NeuroLearn API Documentation

## Overview

NeuroLearn uses **Supabase** as its backend. All data access flows through:
1. **Supabase Client SDK** — Direct table queries from the browser (protected by RLS)
2. **Supabase Edge Functions** — Server-side logic for AI agent invocation and analysis

## Authentication

All requests require a valid Supabase JWT. The client SDK handles token management automatically.

### Auth Endpoints (Supabase Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/v1/signup` | Register new user |
| POST | `/auth/v1/token?grant_type=password` | Sign in with email/password |
| POST | `/auth/v1/logout` | Sign out |
| POST | `/auth/v1/recover` | Send password reset email |
| POST | `/auth/v1/token?grant_type=refresh_token` | Refresh session token |

### Client SDK Usage

```typescript
import { supabase } from '../utils/supabase/client'

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Sign up
const { data, error } = await supabase.auth.signUp({
  email, password,
  options: { data: { display_name: 'Ada' } }
})

// Password reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/login`
})
```

## Data Access (via Supabase Client)

All queries are automatically scoped by RLS policies — users can only access their own data.

### Courses (Read-only)

```typescript
// List published courses
const { data } = await supabase
  .from('courses')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })

// Get single course
const { data } = await supabase
  .from('courses')
  .select('*')
  .eq('id', courseId)
  .single()
```

### Lessons

```typescript
// List lessons for a course
const { data } = await supabase
  .from('lessons')
  .select('*')
  .eq('course_id', courseId)
  .eq('status', 'published')
  .order('sort_order')
```

### Progress

```typescript
// Get lesson progress
const { data } = await supabase
  .from('lesson_progress')
  .select('*')
  .eq('lesson_id', lessonId)
  .eq('user_id', userId)
  .maybeSingle()

// Update progress
const { error } = await supabase
  .from('lesson_progress')
  .upsert({
    user_id: userId,
    lesson_id: lessonId,
    course_id: courseId,
    status: 'completed',
    time_spent_seconds: 300,
  })
```

## Edge Functions

### POST `/functions/v1/agent-invoke`

Invoke a RACA AI agent within a cognitive session.

**Request:**
```json
{
  "session_id": "uuid",
  "agent_id": "framing | research | construction | critique | defense",
  "state": "POSITION | PLAN | APPLY | REVISE | DEFEND | RECONNECT",
  "prompt": "User's message to the agent"
}
```

**Response:**
```json
{
  "response": "Agent's response text",
  "agent_id": "framing",
  "blocked": false,
  "constraint_violations": []
}
```

### POST `/functions/v1/session-sync`

Sync local session state to Supabase.

**Request (POST):**
```json
{
  "session_id": "uuid",
  "state": { "current_state": "APPLY", "regulation": {} },
  "artifacts": []
}
```

**GET `/functions/v1/session-sync?session_id=uuid`**

Retrieve session state from server.

### POST `/functions/v1/epistemic-analyze`

Analyze session artifacts for epistemic growth and TRACE fluency scoring.

**Request:**
```json
{
  "user_id": "uuid",
  "session_id": "uuid",
  "artifacts": []
}
```

**Response:**
```json
{
  "trace": { "think": 7, "reason": 6, "articulate": 8, "check": 5, "extend": 4 },
  "adaptation_level": "guided",
  "signals": []
}
```

## Health Check

**GET `/health.json`** — Returns application status.

```json
{
  "status": "ok",
  "app": "neurolearn",
  "version": "0.1.0"
}
```

## Rate Limiting

Rate limiting is handled at the Supabase project level:
- **Auth endpoints:** 30 requests/minute per IP
- **Database queries:** Governed by Supabase plan limits
- **Edge Functions:** 500 invocations/day (free tier) or plan-based

## CORS

Edge Functions include CORS headers for:
- `http://localhost:5173` (development)
- `https://neurolearn-one.vercel.app` (production)
