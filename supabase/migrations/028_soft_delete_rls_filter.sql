-- Migration 028: Filter soft-deleted profiles in RLS SELECT policies
-- Users who are soft-deleted (deleted_at IS NOT NULL) should not appear in queries

-- Drop and recreate the SELECT policy to include soft-delete filter
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
