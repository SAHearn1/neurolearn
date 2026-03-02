-- 014: RACA Epistemic Profiles
-- Longitudinal cognitive profiles for adaptive support

create table if not exists public.epistemic_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_count integer not null default 0,
  revision_frequency numeric(4,2) not null default 0,
  reflection_depth_avg numeric(8,2) not null default 0,
  defense_strength_avg numeric(8,2) not null default 0,
  framing_sophistication numeric(8,2) not null default 0,
  trace_averages jsonb not null default '{
    "think": 0, "reason": 0, "articulate": 0,
    "check": 0, "extend": 0, "overall": 0
  }'::jsonb,
  growth_trajectory text not null default 'emerging'
    check (growth_trajectory in ('emerging', 'developing', 'proficient')),
  updated_at timestamptz not null default now()
);

-- Epistemic snapshots per session (point-in-time records)
create table if not exists public.epistemic_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.cognitive_sessions(id) on delete cascade,
  trace jsonb not null,
  regulation jsonb not null,
  adaptation_level text not null check (adaptation_level in ('standard', 'guided', 'supported', 'scaffolded')),
  created_at timestamptz not null default now()
);

create index idx_epistemic_snapshots_session on public.epistemic_snapshots(session_id, created_at);

-- RLS
alter table public.epistemic_profiles enable row level security;
alter table public.epistemic_snapshots enable row level security;

create policy "Users can read own epistemic profile"
  on public.epistemic_profiles for select
  using (auth.uid() = user_id);

create policy "Users can manage own epistemic snapshots"
  on public.epistemic_snapshots for all
  using (
    session_id in (
      select id from public.cognitive_sessions where user_id = auth.uid()
    )
  );
