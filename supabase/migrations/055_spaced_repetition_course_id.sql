-- Migration 055: add course_id to spaced_repetition_queue
ALTER TABLE spaced_repetition_queue ADD COLUMN IF NOT EXISTS course_id text;
