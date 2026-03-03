-- Migration 030: Add owner_id to courses and lessons for educator content authoring
-- Educators may only modify content they own.
-- owner_id is the profiles.user_id of the educator who created the item.

-- courses: add owner_id column
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_owner ON public.courses(owner_id);

-- lessons: add owner_id column
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_owner ON public.lessons(owner_id);

-- RLS: educators may insert courses they own
CREATE POLICY "Educators can insert own courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('educator', 'admin')
    )
  );

-- RLS: educators may update their own courses (or admins all courses)
CREATE POLICY "Educators can update own courses"
  ON public.courses FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS: educators may insert lessons for courses they own
CREATE POLICY "Educators can insert own lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('educator', 'admin')
    )
  );

-- RLS: educators may update their own lessons (or admins all lessons)
CREATE POLICY "Educators can update own lessons"
  ON public.lessons FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
