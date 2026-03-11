-- Migration 052: Session parent narratives
-- PAR-05: Parent Growth Narratives

CREATE TABLE IF NOT EXISTS session_parent_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_identifier text NOT NULL,
  narrative_text text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_identifier)
);
ALTER TABLE session_parent_narratives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own narratives" ON session_parent_narratives
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role manages narratives" ON session_parent_narratives
  FOR ALL TO service_role USING (true) WITH CHECK (true);
