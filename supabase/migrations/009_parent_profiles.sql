-- Parent profile extension
-- Adds parent-specific fields beyond the base profiles table.
-- The base profiles.role = 'parent' gates access.

create table if not exists public.parent_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  relationship_type text check (relationship_type in ('parent', 'guardian', 'caregiver', 'other')) default 'parent',
  contact_phone text,
  contact_preference text check (contact_preference in ('email', 'phone', 'both', 'none')) default 'email',
  notification_frequency text check (notification_frequency in ('daily', 'weekly', 'monthly', 'immediate')) default 'weekly',
  timezone text default 'America/New_York',
  max_linked_students integer default 5 check (max_linked_students > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.parent_profiles enable row level security;

-- Parents can read/update their own profile
create policy "Parents can view own profile"
  on public.parent_profiles for select
  using (auth.uid() = user_id);

create policy "Parents can update own profile"
  on public.parent_profiles for update
  using (auth.uid() = user_id);

create policy "Parents can insert own profile"
  on public.parent_profiles for insert
  with check (auth.uid() = user_id);

-- Educators can view parent profiles of their students
create policy "Educators can view student parents"
  on public.parent_profiles for select
  using (
    exists (
      select 1 from public.parent_student_links psl
      join public.class_enrollments ce on ce.student_id = psl.student_id
      join public.classes c on c.id = ce.class_id
      where psl.parent_id = parent_profiles.user_id
        and c.educator_id = auth.uid()
        and psl.status = 'active'
    )
  );

-- Admins can view all parent profiles
create policy "Admins can view all parent profiles"
  on public.parent_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
  );
