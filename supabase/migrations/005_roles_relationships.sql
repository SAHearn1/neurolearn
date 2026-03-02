-- Migration 005: Role and relationship tables
-- Supports RBAC with 4 roles and parent/educator linking

-- Add role column to profiles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('learner', 'parent', 'educator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'learner';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Parent-student linking
CREATE TABLE IF NOT EXISTS parent_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents see own links" ON parent_student_links
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = student_id);

CREATE POLICY "Parents create links" ON parent_student_links
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Educator-class structure
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Educators manage own classes" ON classes
  FOR ALL USING (auth.uid() = educator_id);

-- Class enrollment
CREATE TABLE IF NOT EXISTS class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Educators see class enrollments" ON class_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.educator_id = auth.uid())
    OR auth.uid() = student_id
  );

CREATE POLICY "Educators manage class enrollments" ON class_enrollments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.educator_id = auth.uid())
  );
