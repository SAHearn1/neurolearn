-- 012: RACA Session Notes
-- Lightweight in-session scratchpad entries that the persistence layer
-- writes to during active cognitive sessions. Separate from raca_artifacts
-- (final work products) — these are transient working notes.

create table if not exists public.raca_session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.cognitive_sessions(id) on delete cascade,
  state text not null,
  content text not null,
  note_type text not null default 'scratch'
    check (note_type in ('scratch', 'prompt_response', 'reminder', 'link')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_session_notes_session on public.raca_session_notes(session_id, created_at);

alter table public.raca_session_notes enable row level security;

create policy "Users can manage own session notes"
  on public.raca_session_notes for all
  using (
    session_id in (
      select id from public.cognitive_sessions where user_id = auth.uid()
    )
  );
