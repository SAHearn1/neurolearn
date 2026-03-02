-- Migration 023: Add moderation status to lessons
-- Supports admin content moderation workflow

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved'
  CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'));

CREATE INDEX IF NOT EXISTS idx_lessons_moderation_status
  ON public.lessons(moderation_status);
