-- Migration 025: Prevent non-admin users from escalating their own role
-- Fixes: RLS self-role-escalation vulnerability on profiles table

-- Drop the permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Re-create with WITH CHECK that prevents role column changes for non-admins
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Admins can change any field including role
      EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
      -- Non-admins cannot change their role
      OR role = (SELECT p.role FROM profiles p WHERE p.user_id = auth.uid())
    )
  );
