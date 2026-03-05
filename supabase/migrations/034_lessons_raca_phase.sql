-- 034: RACA Phase tagging for lessons
-- REQ-18-10 (#207) — Educator RACA-Aware Course Builder.
-- Adds a raca_phase column to lessons so educators can tag which cognitive
-- state a lesson is designed to support. Lessons without a tag (NULL) are
-- treated as general-purpose and available in any state.

alter table public.lessons
  add column if not exists raca_phase text
    check (raca_phase in (
      'ROOT', 'REGULATE', 'POSITION', 'PLAN',
      'APPLY', 'REVISE', 'DEFEND', 'RECONNECT', 'ARCHIVE'
    ));

comment on column public.lessons.raca_phase is
  'Optional: the RACA cognitive state this lesson is designed to support. '
  'NULL = general-purpose (shown in any state). '
  'Set by educators to gate lesson visibility to the matching cognitive phase.';

-- Index for filtering lessons by RACA phase (used in SessionPage lesson browser)
create index if not exists idx_lessons_raca_phase
  on public.lessons(raca_phase)
  where raca_phase is not null;
