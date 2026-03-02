-- Educator profile extension
-- Adds educator-specific fields beyond the base profiles table.
-- The base profiles.role = 'educator' gates access.

create table if not exists public.educator_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  school_name text,
  department text,
  subjects text[] default '{}',
  certifications text[] default '{}',
  bio text,
  years_experience integer default 0 check (years_experience >= 0),
  max_class_size integer default 30 check (max_class_size > 0),
  accepting_students boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for finding educators by subject
create index if not exists idx_educator_profiles_subjects
  on public.educator_profiles using gin (subjects);

-- RLS
alter table public.educator_profiles enable row level security;

-- Educators can read/update their own profile
create policy "Educators can view own profile"
  on public.educator_profiles for select
  using (auth.uid() = user_id);

create policy "Educators can update own profile"
  on public.educator_profiles for update
  using (auth.uid() = user_id);

create policy "Educators can insert own profile"
  on public.educator_profiles for insert
  with check (auth.uid() = user_id);

-- Students can view their educator's profile (via class enrollment)
create policy "Students can view their educators"
  on public.educator_profiles for select
  using (
    exists (
      select 1 from public.class_enrollments ce
      join public.classes c on c.id = ce.class_id
      where c.educator_id = educator_profiles.user_id
        and ce.student_id = auth.uid()
    )
  );

-- Parents can view educators of their linked students
create policy "Parents can view child educators"
  on public.educator_profiles for select
  using (
    exists (
      select 1 from public.parent_student_links psl
      join public.class_enrollments ce on ce.student_id = psl.student_id
      join public.classes c on c.id = ce.class_id
      where c.educator_id = educator_profiles.user_id
        and psl.parent_id = auth.uid()
        and psl.status = 'active'
    )
  );

-- Admins can view all educator profiles
create policy "Admins can view all educator profiles"
  on public.educator_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
  );
