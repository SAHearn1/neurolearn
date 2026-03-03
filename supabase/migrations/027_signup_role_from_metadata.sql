-- Migration 027: Update handle_new_user to read role from signup metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  signup_role user_role;
BEGIN
  -- Read role from signup metadata, default to 'learner'
  signup_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::user_role,
    'learner'
  );

  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', ''),
    signup_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
