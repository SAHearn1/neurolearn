create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content_type text not null,
  content_url text,
  content_body text,
  order_index integer not null,
  created_at timestamptz default now()
);
