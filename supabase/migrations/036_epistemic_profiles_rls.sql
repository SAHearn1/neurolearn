-- Migration 036: Epistemic profiles RLS for educator and parent roles — REQ-18-11
-- Enables educators and parents to read their linked students' epistemic profiles.
-- Educator access: requires active educator_student_link.
-- Parent access: requires confirmed parent_student_link.

-- ── Educators: read linked students' epistemic profiles ───────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'epistemic_profiles'
      AND policyname = 'Educators can read linked students epistemic profiles'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Educators can read linked students epistemic profiles"
        ON public.epistemic_profiles
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.educator_student_links
            WHERE educator_id = auth.uid()
              AND student_id = epistemic_profiles.user_id
              AND status = 'active'
          )
        )
    $policy$;
  END IF;
END $$;

-- ── Parents: read linked students' epistemic profiles ─────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'epistemic_profiles'
      AND policyname = 'Parents can read linked students epistemic profiles'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Parents can read linked students epistemic profiles"
        ON public.epistemic_profiles
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.parent_student_links
            WHERE parent_id = auth.uid()
              AND student_id = epistemic_profiles.user_id
              AND status = 'confirmed'
          )
        )
    $policy$;
  END IF;
END $$;
