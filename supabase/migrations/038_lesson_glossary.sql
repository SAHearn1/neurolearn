-- Add glossary JSONB column to lessons table
-- Schema: { "term": "plain-language definition", ... }
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS glossary jsonb DEFAULT '{}';
