-- Migration 035: RACA production schema updates — REQ-18-11
-- Prerequisite for Phase 18 features: deep-work streak, onboarding tracking,
-- RACA-aware course builder, and agent interaction block reason.

-- ── raca_agent_interactions: add block_reason ──────────────────────────────
-- REQ-18-11: agent-invoke response block_reason was missing from schema.
ALTER TABLE public.raca_agent_interactions
  ADD COLUMN IF NOT EXISTS block_reason text;

-- ── profiles: deep work streak — REQ-18-08 ────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deep_work_streak_days integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_deep_work_date date;

-- ── profiles: first-run onboarding tracking — REQ-18-05 ───────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- ── lessons: RACA cognitive design config — REQ-18-10 ─────────────────────
-- Stores: { target_dims, defend_prompt, position_seed, session_depth, artifact_criteria }
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS raca_config jsonb;
