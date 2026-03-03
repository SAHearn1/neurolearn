-- Migration 032: RLS hardening + parent messaging

-- ISSUE 1: adaptive_learning_state requires INSERT for upsert-first-write.
DROP POLICY IF EXISTS "Users insert own adaptive state" ON public.adaptive_learning_state;
CREATE POLICY "Users insert own adaptive state" ON public.adaptive_learning_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ISSUE 2 + ISSUE 8: Complete parent_student_links lifecycle and normalize statuses.
ALTER TABLE public.parent_student_links
  DROP CONSTRAINT IF EXISTS parent_student_links_status_check;

ALTER TABLE public.parent_student_links
  ADD CONSTRAINT parent_student_links_status_check
  CHECK (status IN ('pending', 'active', 'revoked'));

DROP POLICY IF EXISTS "Parents update own links" ON public.parent_student_links;
CREATE POLICY "Parents update own links" ON public.parent_student_links
  FOR UPDATE
  USING (auth.uid() = parent_id)
  WITH CHECK (
    auth.uid() = parent_id
    AND status IN ('pending', 'active', 'revoked')
  );

DROP POLICY IF EXISTS "Students respond to pending links" ON public.parent_student_links;
CREATE POLICY "Students respond to pending links" ON public.parent_student_links
  FOR UPDATE
  USING (auth.uid() = student_id AND status = 'pending')
  WITH CHECK (auth.uid() = student_id AND status IN ('active', 'revoked'));

DROP POLICY IF EXISTS "Admins manage all links" ON public.parent_student_links;
CREATE POLICY "Admins manage all links" ON public.parent_student_links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins delete links" ON public.parent_student_links;
CREATE POLICY "Admins delete links" ON public.parent_student_links
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ISSUE 3: class_enrollments needs DELETE for educator class ownership.
DROP POLICY IF EXISTS "Educators delete class enrollments" ON public.class_enrollments;
CREATE POLICY "Educators delete class enrollments" ON public.class_enrollments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_enrollments.class_id
      AND c.educator_id = auth.uid()
    )
  );

-- ISSUE 4: Parent <-> educator direct messaging table with strict relationship checks.
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_participants_created
  ON public.messages (sender_id, recipient_id, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read messages" ON public.messages;
CREATE POLICY "Participants read messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Parents message linked educators" ON public.messages;
CREATE POLICY "Parents message linked educators" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles parent_profile
      WHERE parent_profile.user_id = auth.uid()
      AND parent_profile.role = 'parent'
    )
    AND EXISTS (
      SELECT 1
      FROM public.profiles educator_profile
      WHERE educator_profile.user_id = recipient_id
      AND educator_profile.role = 'educator'
    )
    AND EXISTS (
      SELECT 1
      FROM public.parent_student_links psl
      JOIN public.class_enrollments ce ON ce.student_id = psl.student_id
      JOIN public.classes c ON c.id = ce.class_id
      WHERE psl.parent_id = auth.uid()
      AND psl.status = 'active'
      AND c.educator_id = recipient_id
    )
  );

DROP POLICY IF EXISTS "Educators message linked parents" ON public.messages;
CREATE POLICY "Educators message linked parents" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles educator_profile
      WHERE educator_profile.user_id = auth.uid()
      AND educator_profile.role = 'educator'
    )
    AND EXISTS (
      SELECT 1
      FROM public.profiles parent_profile
      WHERE parent_profile.user_id = recipient_id
      AND parent_profile.role = 'parent'
    )
    AND EXISTS (
      SELECT 1
      FROM public.parent_student_links psl
      JOIN public.class_enrollments ce ON ce.student_id = psl.student_id
      JOIN public.classes c ON c.id = ce.class_id
      WHERE psl.parent_id = recipient_id
      AND psl.status = 'active'
      AND c.educator_id = auth.uid()
    )
  );
