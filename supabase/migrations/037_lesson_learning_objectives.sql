-- Add learning_objectives array column to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS learning_objectives text[] DEFAULT '{}';
