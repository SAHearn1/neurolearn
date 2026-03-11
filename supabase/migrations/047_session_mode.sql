-- Migration 047: Add session_mode to cognitive_sessions
-- AGY-02: Session Mode Choice Selector

ALTER TABLE public.cognitive_sessions
  ADD COLUMN IF NOT EXISTS session_mode text
  DEFAULT 'standard'
  CHECK (session_mode IN ('review','standard','challenge','mastery_check'));
