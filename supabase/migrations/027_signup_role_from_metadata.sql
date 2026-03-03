-- Migration 027: Prevent admin role injection via signup metadata
-- The handle_new_user() trigger previously accepted any role from
-- raw_user_meta_data. A malicious client could pass role = 'admin'
-- during signup and gain full privilege escalation.
--
-- This migration replaces the trigger function so that:
--   • Only 'learner', 'parent', 'educator' are accepted from client metadata
--   • 'admin' (or any unrecognised value) is silently downgraded to 'learner'
--   • Admin promotion is only possible via a manual process or a
--     server-side function using the service-role key.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  raw_role    text;
  signup_role user_role;
BEGIN
  raw_role := COALESCE(new.raw_user_meta_data ->> 'role', 'learner');

  -- Only allow safe, self-assignable roles at signup.
  -- 'admin' is intentionally excluded; attempting to pass it yields 'learner'.
  signup_role := CASE
    WHEN raw_role IN ('learner', 'parent', 'educator') THEN raw_role::user_role
    ELSE 'learner'::user_role
  END;

  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', ''),
    signup_role
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
