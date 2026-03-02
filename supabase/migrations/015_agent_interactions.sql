-- 015: RACA Agent Interactions
-- Records every AI agent invocation and its validation results

create table if not exists public.raca_agent_interactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.cognitive_sessions(id) on delete cascade,
  agent_id text not null check (agent_id in ('framing', 'research', 'construction', 'critique', 'defense')),
  state text not null,
  prompt text not null,
  response text,
  blocked boolean not null default false,
  block_reason text,
  constraint_violations text[] not null default '{}',
  response_time_ms integer,
  created_at timestamptz not null default now()
);

create index idx_interactions_session on public.raca_agent_interactions(session_id, created_at);
create index idx_interactions_agent on public.raca_agent_interactions(agent_id);

-- RLS
alter table public.raca_agent_interactions enable row level security;

create policy "Users can manage own agent interactions"
  on public.raca_agent_interactions for all
  using (
    session_id in (
      select id from public.cognitive_sessions where user_id = auth.uid()
    )
  );
