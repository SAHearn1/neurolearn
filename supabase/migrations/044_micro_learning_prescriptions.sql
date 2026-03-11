-- Migration 044: micro_learning_prescriptions table
-- AI-02: Gap Detection + Micro-Learning Prescription Engine

CREATE TABLE IF NOT EXISTS micro_learning_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text,
  prescribed_at timestamptz DEFAULT now(),
  gap_type text NOT NULL CHECK (gap_type IN ('trace_weakness', 'incomplete_states', 'low_mastery', 'first_session')),
  recommended_lesson_id text,
  recommended_action text NOT NULL,
  priority int DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  resolved boolean DEFAULT false,
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user
  ON micro_learning_prescriptions(user_id, prescribed_at DESC);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user_resolved
  ON micro_learning_prescriptions(user_id, resolved);

ALTER TABLE micro_learning_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own prescriptions" ON micro_learning_prescriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
