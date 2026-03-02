-- 011: RACA Cognitive State History
-- Records each state transition with metadata for replay and analytics

create table if not exists public.cognitive_state_history (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.cognitive_sessions(id) on delete cascade,
  from_state text not null,
  to_state text not null,
  source text not null check (source in ('learner_action', 'system', 'agent_response', 'timer')),
  regulation_level integer not null,
  artifact_count integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_state_history_session on public.cognitive_state_history(session_id, created_at);

-- Artifacts table — immutable learner work products
create table if not exists public.raca_artifacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.cognitive_sessions(id) on delete cascade,
  kind text not null check (kind in (
    'reflection', 'position_frame', 'plan_outline', 'draft',
    'revision', 'defense_response', 'reconnection_reflection'
  )),
  state text not null,
  content text not null,
  word_count integer not null default 0,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create index idx_artifacts_session on public.raca_artifacts(session_id, kind);

-- RLS
alter table public.cognitive_state_history enable row level security;
alter table public.raca_artifacts enable row level security;

create policy "Users can manage own state history"
  on public.cognitive_state_history for all
  using (
    session_id in (
      select id from public.cognitive_sessions where user_id = auth.uid()
    )
  );

create policy "Users can manage own artifacts"
  on public.raca_artifacts for all
  using (
    session_id in (
      select id from public.cognitive_sessions where user_id = auth.uid()
    )
  );
