-- Migration 057: Artifact audit chain improvements
-- Issue #337: artifact_id FK in skill_evidence_events + immutability on raca_artifacts

-- 1. Add artifact_id FK to skill_evidence_events
ALTER TABLE skill_evidence_events
  ADD COLUMN IF NOT EXISTS artifact_id uuid REFERENCES raca_artifacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_skill_evidence_artifact
  ON skill_evidence_events(artifact_id)
  WHERE artifact_id IS NOT NULL;

-- 2. Immutability trigger on raca_artifacts — prevent content from being changed after a 5-minute grace period
CREATE OR REPLACE FUNCTION enforce_artifact_immutability()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates within 5 minutes of creation (typo grace period)
  IF OLD.created_at > (now() - INTERVAL '5 minutes') THEN
    RETURN NEW;
  END IF;

  -- After grace period: only allow version and word_count metadata updates, block content changes
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    RAISE EXCEPTION 'raca_artifacts content is immutable after the 5-minute grace period. Create a new artifact version instead.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_artifact_immutability ON raca_artifacts;
CREATE TRIGGER trg_artifact_immutability
  BEFORE UPDATE ON raca_artifacts
  FOR EACH ROW EXECUTE FUNCTION enforce_artifact_immutability();
