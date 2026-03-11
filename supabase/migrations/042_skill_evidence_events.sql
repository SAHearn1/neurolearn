-- Migration 042: skill_evidence_events table
-- AI-04: Formative Skill Evidence Collection — stores per-turn skill evidence from RACA sessions.

CREATE TABLE IF NOT EXISTS skill_evidence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  lesson_id text,
  cognitive_state text NOT NULL,
  agent_id text NOT NULL,
  evidence_type text NOT NULL CHECK (evidence_type IN ('skill_demonstrated','misconception','partial_understanding','no_evidence')),
  skill_code text,
  confidence float CHECK (confidence >= 0 AND confidence <= 1),
  artifact_excerpt text,
  detected_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_evidence_user
  ON skill_evidence_events(user_id, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_evidence_session
  ON skill_evidence_events(session_id);

ALTER TABLE skill_evidence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own evidence" ON skill_evidence_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own evidence" ON skill_evidence_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
