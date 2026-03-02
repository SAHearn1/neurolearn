-- 003: Lessons table

create type lesson_type as enum ('text', 'video', 'audio', 'interactive', 'quiz');
create type lesson_status as enum ('draft', 'published', 'archived');

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  type lesson_type not null default 'text',
  status lesson_status not null default 'draft',
  content text,
  sort_order integer not null default 0,
  duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_lessons_course on public.lessons(course_id, sort_order);

-- RLS
alter table public.lessons enable row level security;

create policy "Authenticated users can read published lessons"
  on public.lessons for select
  using (
    auth.role() = 'authenticated'
    and status = 'published'
  );
