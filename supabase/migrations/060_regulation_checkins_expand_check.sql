-- Migration 060: Expand regulation_checkins level CHECK constraint
--
-- Problem: FormativeCheckIn (used at POSITION→PLAN, PLAN→APPLY, REVISE→DEFEND)
-- inserts levels 'confident' | 'unsure' | 'need_more_time', but the original
-- CHECK constraint only allows 'ready' | 'distracted' | 'struggling' (which are
-- the RegulationCheckIn values used at session start and APPLY→REVISE).
-- Both check-in types persist to the same table; the constraint must cover both.

ALTER TABLE public.regulation_checkins
  DROP CONSTRAINT IF EXISTS regulation_checkins_level_check;

ALTER TABLE public.regulation_checkins
  ADD CONSTRAINT regulation_checkins_level_check
  CHECK (level IN (
    'ready', 'distracted', 'struggling',
    'confident', 'unsure', 'need_more_time'
  ));
