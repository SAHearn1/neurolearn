-- Migration 019: Parent profile enhancements
-- Adds boolean notification toggles for email/push

ALTER TABLE public.parent_profiles
  ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true;

ALTER TABLE public.parent_profiles
  ADD COLUMN IF NOT EXISTS notification_push boolean DEFAULT false;
