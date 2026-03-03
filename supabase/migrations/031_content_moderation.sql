-- Migration 031: Content moderation queue
-- Allows learners to flag content (lessons/courses) for review.
-- Admins process the queue via the admin-moderation-queue edge function.

CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('lesson', 'course')),
  resource_id uuid NOT NULL,
  reason text NOT NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_flags_status ON public.content_flags(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_flags_resource ON public.content_flags(resource_type, resource_id);

ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- Learners can insert flags for their own reports.
CREATE POLICY "Authenticated users can report content"
  ON public.content_flags FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters can see their own flags.
CREATE POLICY "Reporters can see own flags"
  ON public.content_flags FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can see all flags (enforced at function level via service role).
-- No direct SELECT policy for admin — they query via edge function.
