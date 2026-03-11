-- Migration 040: Add float-based current_difficulty and mastery_score columns
-- to adaptive_learning_state for the AI-06 Adaptive Difficulty Engine.
-- The existing current_difficulty column is TEXT ('easy','medium','hard','adaptive').
-- We add new float columns alongside the legacy text column.

ALTER TABLE public.adaptive_learning_state
  ADD COLUMN IF NOT EXISTS current_difficulty_float float DEFAULT 0.1;

ALTER TABLE public.adaptive_learning_state
  ADD COLUMN IF NOT EXISTS mastery_score_float float DEFAULT 0.0;

-- Stores the last N session score snapshots for EMA computation
ALTER TABLE public.adaptive_learning_state
  ADD COLUMN IF NOT EXISTS recent_scores float[] DEFAULT '{}';

-- Update constraints
DO $$ BEGIN
  ALTER TABLE public.adaptive_learning_state
    ADD CONSTRAINT adaptive_difficulty_float_range
    CHECK (current_difficulty_float >= 0.0 AND current_difficulty_float <= 1.0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.adaptive_learning_state
    ADD CONSTRAINT adaptive_mastery_float_range
    CHECK (mastery_score_float >= 0.0 AND mastery_score_float <= 1.0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for fast lookup by difficulty band
CREATE INDEX IF NOT EXISTS idx_adaptive_state_difficulty_float
  ON public.adaptive_learning_state(current_difficulty_float);
