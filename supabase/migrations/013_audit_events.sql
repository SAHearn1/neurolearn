-- 013: RACA Audit Events
-- Append-only event log for session activity

create table if not exists public.raca_audit_events (
  id uuid primary key,
  session_id uuid not null references public.cognitive_sessions(id) on delete cascade,
  kind text not null,
  source text not null check (source in ('learner_action', 'system', 'agent_response', 'timer')),
  state_before text,
  state_after text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_session on public.raca_audit_events(session_id, created_at);
create index idx_audit_kind on public.raca_audit_events(kind);

-- RLS: users can read their own session events
alter table public.raca_audit_events enable row level security;

create policy "Users can read own audit events"
  on public.raca_audit_events for select
  using (
    session_id in (
      select id from public.cognitive_sessions
      where user_id = auth.uid()
    )
  );

create policy "Users can insert own audit events"
  on public.raca_audit_events for insert
  with check (
    session_id in (
      select id from public.cognitive_sessions
      where user_id = auth.uid()
    )
  );
