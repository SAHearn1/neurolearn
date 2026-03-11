-- Migration 050: CCSS Standards schema
-- CCSS-01: Common Core Standards Schema

CREATE TABLE IF NOT EXISTS ccss_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_code text NOT NULL UNIQUE,
  strand text NOT NULL CHECK (strand IN ('ELA','Math')),
  grade text NOT NULL,
  domain text NOT NULL,
  description text NOT NULL,
  anchor_standard text
);
ALTER TABLE ccss_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read standards" ON ccss_standards
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS skill_to_ccss_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_code text NOT NULL,
  ccss_standard_code text NOT NULL REFERENCES ccss_standards(standard_code) ON DELETE CASCADE,
  mapping_strength float DEFAULT 0.8 CHECK (mapping_strength >= 0 AND mapping_strength <= 1),
  UNIQUE(skill_code, ccss_standard_code)
);
ALTER TABLE skill_to_ccss_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read skill map" ON skill_to_ccss_map
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS student_ccss_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ccss_standard_code text NOT NULL REFERENCES ccss_standards(standard_code) ON DELETE CASCADE,
  evidence_count int DEFAULT 1,
  total_confidence float DEFAULT 0,
  mastery_level text DEFAULT 'emerging' CHECK (mastery_level IN ('emerging','developing','proficient','advanced')),
  last_evidenced_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ccss_standard_code)
);
ALTER TABLE student_ccss_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own CCSS evidence" ON student_ccss_evidence
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role manages CCSS evidence" ON student_ccss_evidence
  FOR ALL TO service_role USING (true) WITH CHECK (true);
