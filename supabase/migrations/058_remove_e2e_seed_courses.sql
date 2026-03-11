-- Migration 058: Remove E2E seed courses from production
-- Issue #318: "Reading Fundamentals" and "Math Concepts" were inserted by
-- seed-e2e.ts and should not be visible to real learners.
-- This deletes them only if their description matches the exact seed text,
-- to avoid accidentally removing user-created courses with the same name.

DELETE FROM courses
WHERE (
    (title = 'Reading Fundamentals'
     AND description LIKE 'Build core reading skills with accessible, multimodal lessons%')
    OR
    (title = 'Math Concepts'
     AND description LIKE 'Explore foundational math ideas through visual walkthroughs%')
);
