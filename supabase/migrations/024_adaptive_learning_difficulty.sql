-- Migration 024: Add difficulty level to lessons and performance tracking
-- Supports AI adaptive learning engine

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 2;

-- Add constraint separately (can't combine with ADD COLUMN IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE public.lessons ADD CONSTRAINT lessons_difficulty_level_check
    CHECK (difficulty_level BETWEEN 1 AND 5);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Performance tracking columns on adaptive_learning_state
ALTER TABLE public.adaptive_learning_state
  ADD COLUMN IF NOT EXISTS performance_score float DEFAULT NULL;

ALTER TABLE public.adaptive_learning_state
  ADD COLUMN IF NOT EXISTS recommended_difficulty integer DEFAULT 2;

ALTER TABLE public.adaptive_learning_state
  ADD COLUMN IF NOT EXISTS cognitive_load_indicator float DEFAULT NULL;

-- Index for fast lesson lookup by difficulty within a course
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty
  ON public.lessons(difficulty_level, course_id);
