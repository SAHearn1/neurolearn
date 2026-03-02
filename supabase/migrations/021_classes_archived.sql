-- Migration 021: Add archived column to classes
-- Supports class archiving without hard-delete

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_classes_archived
  ON public.classes(archived);
