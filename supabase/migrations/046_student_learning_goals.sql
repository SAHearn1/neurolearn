-- Migration 046: student_learning_goals table
-- AGY-01: Student Learning Goal Setting

CREATE TABLE IF NOT EXISTS student_learning_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_text text NOT NULL CHECK (char_length(goal_text) <= 280),
  goal_type text DEFAULT 'open' CHECK (goal_type IN ('open','skill','exam','curiosity')),
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true,
  achieved boolean DEFAULT false,
  achieved_at timestamptz
);

ALTER TABLE student_learning_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own goals" ON student_learning_goals
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
