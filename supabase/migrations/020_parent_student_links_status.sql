-- Migration 020: Extend parent_student_links status values
-- Adds 'approved' and 'rejected' as valid status values alongside existing 'pending', 'active', 'revoked'

-- Drop existing check constraint and recreate with extended values
ALTER TABLE public.parent_student_links
  DROP CONSTRAINT IF EXISTS parent_student_links_status_check;

ALTER TABLE public.parent_student_links
  ADD CONSTRAINT parent_student_links_status_check
  CHECK (status IN ('pending', 'active', 'approved', 'revoked', 'rejected'));

-- Index for fast lookup by parent + status
CREATE INDEX IF NOT EXISTS idx_psl_parent_status
  ON public.parent_student_links(parent_id, status);
