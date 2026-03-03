-- Migration 029: Prevent DELETE on immutable audit tables
-- audit_log and audit_events should be append-only — no deletions allowed

-- audit_log: block all deletes
CREATE POLICY "No deletes on audit_log" ON public.audit_log
  FOR DELETE USING (false);

-- raca_audit_events: block all deletes
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'raca_audit_events' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "No deletes on raca_audit_events" ON public.raca_audit_events FOR DELETE USING (false)';
  END IF;
END $$;
