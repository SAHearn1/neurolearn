-- Milestone notifications for parents when students hit learning milestones
CREATE TABLE IF NOT EXISTS milestone_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type text NOT NULL,
  lesson_title text,
  course_title text,
  created_at timestamptz DEFAULT now() NOT NULL,
  read_at timestamptz
);

ALTER TABLE milestone_notifications ENABLE ROW LEVEL SECURITY;

-- Parents can read their own notifications
CREATE POLICY "Parents read own milestone notifications"
  ON milestone_notifications FOR SELECT
  USING (parent_id = auth.uid());

-- System can insert (service role) — learner client inserts via edge function
-- For client-side insert during development, allow authenticated insert for own student_id
CREATE POLICY "Authenticated users insert milestone notifications"
  ON milestone_notifications FOR INSERT
  WITH CHECK (student_id = auth.uid());
