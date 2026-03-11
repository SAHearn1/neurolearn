-- Migration 045: mastery_cooldowns table
-- ASS-01: Mastery Demonstration Mode — prevents abuse of mastery check attempts

CREATE TABLE IF NOT EXISTS mastery_cooldowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  attempt_at timestamptz DEFAULT now(),
  cooldown_until timestamptz NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE mastery_cooldowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cooldowns" ON mastery_cooldowns
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
