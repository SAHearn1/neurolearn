-- 033: RACA Production Indexes + Ethical TRACE Field
-- REQ-18-11 (#208) — Performance indexes for production query patterns
-- and schema update to include the ethical dimension in epistemic_profiles.
--
-- Query patterns addressed:
--   agent-invoke: SELECT kind FROM raca_artifacts WHERE session_id = ? AND kind IN (...)
--   epistemic-analyze: SELECT * FROM epistemic_profiles WHERE user_id = ?
--   educator LCP: SELECT * FROM epistemic_profiles WHERE user_id IN (...)
--   admin blocked: SELECT * FROM raca_agent_interactions WHERE blocked = true
--   session history: SELECT * FROM cognitive_sessions WHERE user_id = ? ORDER BY started_at DESC

-- ── raca_artifacts ─────────────────────────────────────────────────────────
-- Existing: idx_artifacts_session (session_id, kind)
-- Added: kind-only index for cross-session analytics; state for filtering

create index if not exists idx_artifacts_kind
  on public.raca_artifacts(kind);

create index if not exists idx_artifacts_state
  on public.raca_artifacts(state);

create index if not exists idx_artifacts_created
  on public.raca_artifacts(created_at desc);

-- ── raca_agent_interactions ────────────────────────────────────────────────
-- Existing: idx_interactions_session (session_id, created_at)
--           idx_interactions_agent (agent_id)
-- Added: blocked filter for admin dashboard; state for analytics

create index if not exists idx_interactions_blocked
  on public.raca_agent_interactions(blocked, session_id)
  where blocked = true;

create index if not exists idx_interactions_state
  on public.raca_agent_interactions(state);

-- ── cognitive_sessions ─────────────────────────────────────────────────────
-- Existing: idx_sessions_user (user_id), idx_sessions_status (active only)
-- Added: compound for session history view (user ordered by time)

create index if not exists idx_sessions_user_started
  on public.cognitive_sessions(user_id, started_at desc);

-- ── epistemic_profiles ─────────────────────────────────────────────────────
-- Add the ethical dimension (spec §VIII) to the trace_averages JSONB default
-- and backfill any existing rows that are missing the key.

alter table public.epistemic_profiles
  alter column trace_averages set default '{
    "think": 0, "reason": 0, "articulate": 0,
    "check": 0, "extend": 0, "ethical": 0, "overall": 0
  }'::jsonb;

-- Backfill: add ethical = 0 to any profiles that predate spec §VIII
update public.epistemic_profiles
  set trace_averages = trace_averages || '{"ethical": 0}'::jsonb
  where not (trace_averages ? 'ethical');

-- ── epistemic_snapshots ────────────────────────────────────────────────────
-- Existing: idx_epistemic_snapshots_session (session_id, created_at)
-- Added: created_at for time-series queries across all sessions

create index if not exists idx_epistemic_snapshots_created
  on public.epistemic_snapshots(created_at desc);

-- ── educator read policy for epistemic_profiles ────────────────────────────
-- Allows educators to read epistemic profiles of students in their classes.

create policy if not exists "Educators can read linked student epistemic profiles"
  on public.epistemic_profiles for select
  using (
    exists (
      select 1
      from public.educator_student_links esl
      join public.profiles p on p.id = auth.uid()
      where esl.student_id = epistemic_profiles.user_id
        and esl.educator_id = auth.uid()
        and p.role = 'educator'
    )
  );
