# PII Handling Procedures and Data Map

## Personal Identifiable Information (PII) Inventory

### Data Map

```
┌──────────────────────────────────────────────────┐
│                  DATA COLLECTION                  │
├──────────────────────────────────────────────────┤
│ Registration: email, display_name, password,     │
│               date_of_birth (for age gate)       │
│ Profile:      avatar_url, learning_styles,       │
│               accessibility preferences          │
│ Usage:        lesson_progress, scores,           │
│               time_spent, cognitive_sessions      │
│ Communication: notifications, messages            │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│                  DATA STORAGE                     │
├──────────────────────────────────────────────────┤
│ Supabase PostgreSQL (RLS-enforced):              │
│   - auth.users (email, encrypted password)       │
│   - profiles (display_name, avatar, prefs)       │
│   - lesson_progress (scores, time tracking)      │
│   - cognitive_sessions (RACA state data)         │
│   - audit_log (action records)                   │
│                                                  │
│ Client-side (localStorage):                      │
│   - neurolearn.settings (accessibility prefs)    │
│   - Session tokens (Supabase JWT)                │
│                                                  │
│ NOT stored:                                      │
│   - Credit card / payment data                   │
│   - Social security numbers                      │
│   - Physical addresses                           │
│   - Phone numbers                                │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│                  DATA PROCESSING                  │
├──────────────────────────────────────────────────┤
│ Internal:                                        │
│   - Progress calculation (aggregation)           │
│   - Adaptive learning (mastery scoring)          │
│   - Epistemic profiling (TRACE analysis)         │
│   - Notification delivery                        │
│                                                  │
│ External (no PII transmitted):                   │
│   - Anthropic API: session context only          │
│   - Vercel: static assets only                   │
└──────────────────────────────────────────────────┘
```

### PII Classification

| Field               | Classification  | Sensitivity | Encrypted            | Access                      |
| ------------------- | --------------- | ----------- | -------------------- | --------------------------- |
| email               | Direct PII      | High        | In transit + at rest | User, Admin                 |
| display_name        | Direct PII      | Medium      | At rest              | User, Linked users          |
| password            | Credential      | Critical    | Bcrypt hash          | Never readable              |
| avatar_url          | Indirect PII    | Low         | At rest              | User, Linked users          |
| date_of_birth       | Direct PII      | High        | At rest              | Admin only                  |
| learning_styles     | Behavioral      | Medium      | At rest              | User, Educator              |
| accessibility_prefs | Health-adjacent | Medium      | At rest              | User only                   |
| lesson_progress     | Educational     | Medium      | At rest              | User, Educator, Parent      |
| cognitive_sessions  | Behavioral      | High        | At rest              | User only                   |
| epistemic_profiles  | Behavioral      | High        | At rest              | User, Educator (aggregated) |

### Handling Procedures

#### Collection

1. Collect minimum data necessary (data minimization principle)
2. Inform user of data collection purpose at point of collection
3. Obtain explicit consent for optional data (RACA, analytics)
4. Age-gate for users under 13 (COPPA compliance)

#### Storage

1. All PII stored in Supabase PostgreSQL with RLS
2. No PII in client-side storage except session tokens
3. No PII in application logs or error reports
4. No PII in AI prompts sent to Anthropic

#### Access

1. Users access own data via authenticated API calls (RLS)
2. Educators access student data only via class enrollment
3. Parents access child data only via verified parent-student link
4. Admins access all data with audit logging
5. No employee access to production database without audit

#### Deletion

1. User-initiated: Settings → Delete Account → 30-day grace → permanent deletion
2. Admin-initiated: Admin Dashboard → User Management → Delete
3. Cascade: Deleting user cascades to progress, sessions, notifications
4. Audit log entries anonymized (actor_id set to NULL) but retained

#### Breach Response

1. Detect: Automated monitoring + manual review of audit logs
2. Contain: Disable affected accounts, rotate credentials
3. Notify: Affected users within 72 hours, authorities if required
4. Remediate: Fix vulnerability, update security controls
5. Document: Incident report filed and retained for 7 years
