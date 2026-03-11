-- Migration 043: Add mastery columns to lesson_progress
-- AI-05: Summative Mastery Evaluation at ARCHIVE

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS mastery_status text
  DEFAULT 'not_started'
  CHECK (mastery_status IN ('not_started', 'in_progress', 'developing', 'proficient'));

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS mastery_source text
  DEFAULT 'unscored'
  CHECK (mastery_source IN ('unscored', 'formative', 'summative', 'raca_session'));
