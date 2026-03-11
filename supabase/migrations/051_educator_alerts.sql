-- Migration 051: Educator intervention alerts
-- EDU-14: Educator Intervention Trigger Alerts

CREATE TABLE IF NOT EXISTS educator_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_regulation','no_activity','mastery_plateau','frustration_spike')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  dismissed_at timestamptz
);
ALTER TABLE educator_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Educators read own alerts" ON educator_alerts
  FOR SELECT TO authenticated USING (auth.uid() = educator_id);
CREATE POLICY "Educators update own alerts" ON educator_alerts
  FOR UPDATE TO authenticated USING (auth.uid() = educator_id);
CREATE POLICY "Service role manages all alerts" ON educator_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
