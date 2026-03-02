create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean default false,
  score integer,
  completed_at timestamptz
);
