# Plan 13-01 Summary — Admin Dashboard + User Management

**Status:** DONE
**Date:** 2026-03-02

## Completed Tasks

1. **AdminDashboardPage** — Enhanced with real Supabase stat queries: Total Users, Active Learners, Total Courses, Lessons Completed. Loading skeletons (animate-pulse) shown while fetching. aria-label on each stat card.
2. **UserManagement** — Enhanced with soft-delete: `deleted_at` timestamp column instead of hard-delete. Deactivated users show "Inactive" badge, role changes and deactivate button disabled for inactive users. Audit log entries created on role change and deactivation.

## Enhancements Made
- `AdminDashboardPage.tsx`: Replaced hardcoded stats with real Supabase `count` queries (profiles, lesson_progress, courses)
- `UserManagement.tsx`: Added `deleted_at` field to ManagedUser, `softDelete` function that sets `deleted_at` timestamp, Deactivate button with confirm dialog, Inactive badge for soft-deleted users
- Migration `022_profiles_soft_delete.sql`: Added `deleted_at timestamptz DEFAULT NULL` to profiles with partial index

## CI Gate
- typecheck: PASS (0 errors)
- lint: PASS (0 warnings)
- test: PASS (24/24)
- build: PASS (clean)
