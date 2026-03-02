-- Migration 017: Educator profile enhancements
-- Adds verified column for admin-approved educator status

ALTER TABLE public.educator_profiles
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Index for finding verified educators
CREATE INDEX IF NOT EXISTS idx_educator_profiles_verified
  ON public.educator_profiles(verified);

-- Admin-only policy for updating verified status
CREATE POLICY "Admins can update educator profiles"
  ON public.educator_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
