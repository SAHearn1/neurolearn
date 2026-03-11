-- Migration 049: Add input_mode to session_artifacts
-- ASS-03: Voice Input Pathway — tracks whether artifact was typed or dictated
-- Note: The artifacts are stored in the runtime store (layer0-runtime), not a
-- separate DB table in current schema. This migration is a placeholder for when
-- raca_session_artifacts table is created, or applies to raca_agent_interactions.
-- Applying to raca_agent_interactions as a proxy for artifact tracking.

-- Placeholder: artifact input_mode column to be added when session_artifacts table exists
-- ALTER TABLE session_artifacts ADD COLUMN IF NOT EXISTS input_mode text DEFAULT 'text';
SELECT 1; -- no-op
