-- 010: RACA Cognitive Sessions
-- Core session table for the agentic cognitive architecture

create table if not exists public.cognitive_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'abandoned')),
  current_state text not null default 'ROOT'
    check (current_state in (
      'ROOT', 'REGULATE', 'POSITION', 'PLAN', 'APPLY',
      'REVISE', 'DEFEND', 'RECONNECT', 'ARCHIVE'
    )),
  state_history text[] not null default '{ROOT}',
  regulation jsonb not null default '{
    "level": 75,
    "signals": [],
    "intervention_active": false,
    "intervention_count": 0,
    "last_check": ""
  }'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_sessions_user on public.cognitive_sessions(user_id);
create index idx_sessions_lesson on public.cognitive_sessions(lesson_id);
create index idx_sessions_status on public.cognitive_sessions(status)
  where status = 'active';

-- RLS
alter table public.cognitive_sessions enable row level security;

create policy "Users can manage own sessions"
  on public.cognitive_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
