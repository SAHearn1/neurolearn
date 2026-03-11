-- Migration 054: Educator checkins
-- DATA-02: Real-Time Classroom View

CREATE TABLE IF NOT EXISTS educator_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at timestamptz DEFAULT now(),
  note text,
  session_identifier text
);
ALTER TABLE educator_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Educators manage own checkins" ON educator_checkins
  FOR ALL TO authenticated USING (auth.uid() = educator_id) WITH CHECK (auth.uid() = educator_id);
