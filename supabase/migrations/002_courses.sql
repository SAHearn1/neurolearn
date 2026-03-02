-- 002: Courses table

create type course_level as enum ('beginner', 'intermediate', 'advanced');
create type course_status as enum ('draft', 'published', 'archived');

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  level course_level not null default 'beginner',
  status course_status not null default 'draft',
  thumbnail_url text,
  lesson_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: published courses are readable by all authenticated users
alter table public.courses enable row level security;

create policy "Authenticated users can read published courses"
  on public.courses for select
  using (auth.role() = 'authenticated' and status = 'published');
