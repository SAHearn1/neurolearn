create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  learning_style text,
  sensory_preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
