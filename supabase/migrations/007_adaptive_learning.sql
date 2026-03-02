-- Migration 007: Adaptive learning state table

CREATE TABLE IF NOT EXISTS adaptive_learning_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  current_difficulty text NOT NULL DEFAULT 'medium' CHECK (current_difficulty IN ('easy', 'medium', 'hard', 'adaptive')),
  mastery_score numeric(5,2) NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),
  recommended_lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  learning_velocity numeric(5,2) DEFAULT 0,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  last_assessment_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_adaptive_state_user ON adaptive_learning_state(user_id);

ALTER TABLE adaptive_learning_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own adaptive state" ON adaptive_learning_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own adaptive state" ON adaptive_learning_state
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Educators can read their students' adaptive states
CREATE POLICY "Educators read student adaptive state" ON adaptive_learning_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      WHERE ce.student_id = adaptive_learning_state.user_id
      AND c.educator_id = auth.uid()
    )
  );
