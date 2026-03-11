-- Migration 048: spaced_repetition_queue table
-- ASS-02: Spaced Repetition Queue — SM-2 scheduling

CREATE TABLE IF NOT EXISTS spaced_repetition_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  skill_code text,
  due_at timestamptz NOT NULL,
  interval_days int DEFAULT 3,
  repetition_count int DEFAULT 0,
  ease_factor float DEFAULT 2.5,
  last_reviewed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending','completed','skipped'))
);

ALTER TABLE spaced_repetition_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own queue" ON spaced_repetition_queue
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
