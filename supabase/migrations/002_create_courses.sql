create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  difficulty text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);
