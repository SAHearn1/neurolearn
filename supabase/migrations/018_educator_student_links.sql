-- Migration 018: Educator-student direct links
-- Allows educators to link directly with students outside class enrollment

CREATE TABLE IF NOT EXISTS public.educator_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  linked_at timestamptz DEFAULT now(),
  UNIQUE(educator_id, student_id, class_id)
);

ALTER TABLE public.educator_student_links ENABLE ROW LEVEL SECURITY;

-- Educators and students can see their own links
CREATE POLICY "Users see own educator-student links"
  ON public.educator_student_links FOR SELECT
  USING (auth.uid() = educator_id OR auth.uid() = student_id);

-- Only verified educators can create links
CREATE POLICY "Educators create links"
  ON public.educator_student_links FOR INSERT
  WITH CHECK (
    auth.uid() = educator_id
    AND EXISTS (
      SELECT 1 FROM public.educator_profiles
      WHERE educator_profiles.user_id = auth.uid()
    )
  );

-- Educators can delete their own links
CREATE POLICY "Educators delete own links"
  ON public.educator_student_links FOR DELETE
  USING (auth.uid() = educator_id);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_esl_educator_id
  ON public.educator_student_links(educator_id);

CREATE INDEX IF NOT EXISTS idx_esl_student_id
  ON public.educator_student_links(student_id);
