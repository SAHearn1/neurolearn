-- Migration 053: Platform intelligence thresholds
-- ADM-03: Platform Intelligence Health Dashboard

CREATE TABLE IF NOT EXISTS platform_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_key text NOT NULL UNIQUE,
  threshold_value float NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
ALTER TABLE platform_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage thresholds" ON platform_thresholds
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Authenticated users can read thresholds" ON platform_thresholds
  FOR SELECT TO authenticated USING (true);

-- Seed default thresholds
INSERT INTO platform_thresholds (threshold_key, threshold_value, description)
VALUES
  ('min_regulation_alert', 40, 'Average regulation below this triggers an educator alert'),
  ('mastery_plateau_sessions', 3, 'No mastery improvement over this many sessions triggers alert'),
  ('inactivity_days', 5, 'Days without activity before no_activity alert fires'),
  ('frustration_spike_threshold', 20, 'Regulation drop to below this in single session')
ON CONFLICT (threshold_key) DO NOTHING;
