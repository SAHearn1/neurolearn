-- Migration 041: regulation_checkins table
-- AI-03: TRACE Fluency Auto-Scorer — stores pre-session regulation check-in data

CREATE TABLE IF NOT EXISTS regulation_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  level text NOT NULL CHECK (level IN ('ready', 'distracted', 'struggling')),
  checked_in_at timestamptz DEFAULT now() NOT NULL
);

-- Index for fast lookup per user
CREATE INDEX IF NOT EXISTS idx_regulation_checkins_user
  ON regulation_checkins(user_id, checked_in_at DESC);

-- Index for per-session lookup
CREATE INDEX IF NOT EXISTS idx_regulation_checkins_session
  ON regulation_checkins(session_id);

-- Row Level Security
ALTER TABLE regulation_checkins ENABLE ROW LEVEL SECURITY;

-- Users can insert their own check-ins
CREATE POLICY "Users insert own regulation checkins"
  ON regulation_checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can read their own check-ins
CREATE POLICY "Users select own regulation checkins"
  ON regulation_checkins FOR SELECT
  USING (user_id = auth.uid());
