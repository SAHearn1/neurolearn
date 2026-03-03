-- Migration 030: Gap analysis remediation fixes
-- Corrects audit delete prevention (029 targeted wrong table),
-- adds missing RLS policies, and adds composite index.

-- 1. Fix audit delete prevention: drop incorrect policy if it exists, add correct one
DO $$ BEGIN
  -- Drop the incorrectly-named policy from 029 if it was applied
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_events' AND policyname = 'No deletes on audit_events'
  ) THEN
    EXECUTE 'DROP POLICY "No deletes on audit_events" ON public.audit_events';
  END IF;

  -- Ensure correct policy on raca_audit_events
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'raca_audit_events' AND table_schema = 'public'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'raca_audit_events' AND policyname = 'No deletes on raca_audit_events'
    ) THEN
      EXECUTE 'CREATE POLICY "No deletes on raca_audit_events" ON public.raca_audit_events FOR DELETE USING (false)';
    END IF;
  END IF;
END $$;

-- 2. Add missing INSERT/UPDATE RLS policies on epistemic_profiles (issue #13)
CREATE POLICY "Users can insert own epistemic profile"
  ON public.epistemic_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own epistemic profile"
  ON public.epistemic_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add composite index on agent_interactions (issue #28)
CREATE INDEX IF NOT EXISTS idx_interactions_session_agent
  ON public.raca_agent_interactions(session_id, agent_id);
