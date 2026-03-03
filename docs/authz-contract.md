# Authorization Contract

## Overview

NeuroLearn enforces a strict boundary between what client code may access
directly via Supabase Row-Level Security (RLS) and what must go through a
Supabase Edge Function.

---

## Rule 1 — Self-only direct access

A client may read or write its **own** rows directly via the Supabase JS
client. RLS policies ensure a user can never see or modify another user's data
through the client.

| Table | Direct client access |
|---|---|
| `profiles` | Own row only (`user_id = auth.uid()`) |
| `lesson_progress` | Own rows only (`user_id = auth.uid()`) |
| `course_enrollments` | Own rows only (`user_id = auth.uid()`) |
| `courses` / `lessons` | Published rows only (read-only) |

---

## Rule 2 — Privileged access only via Edge Functions

Any operation that requires reading **another user's** data must go through a
Supabase Edge Function. Functions run with the service-role key (bypasses RLS)
but enforce their own authorization checks via `supabase/functions/_shared/authz.ts`.

| Operation | Function | Authorization |
|---|---|---|
| Parent views child's progress | `parent-child-progress` | `requireParentOf()` — approved `parent_student_links` row |
| Parent weekly report | `parent-weekly-report` | `requireParentOf()` |
| Parent requests link | `parent-request-link` | caller must have `role = parent` |
| Student approves link | `student-approve-parent-link` | caller must be the student |
| Parent revokes link | `parent-revoke-link` | caller must be the parent |
| Educator views student progress | `educator-student-progress` | `requireEducatorOf()` — student in educator's class |
| Educator manages classes | `educator-create-class`, `educator-add-student`, etc. | `requireRole(['educator','admin'])` + `requireClassOwner()` |
| Educator creates/edits content | `educator-create-course`, `educator-update-lesson`, etc. | `requireRole(['educator','admin'])` + `requireContentOwner()` |
| Admin user management | `admin-list-users`, `admin-get-user`, `admin-set-role` | `requireRole(['admin'])` |
| Admin analytics | `admin-analytics-summary` | `requireRole(['admin'])` |
| Admin moderation | `admin-moderation-queue`, `admin-set-moderation-status` | `requireRole(['admin'])` |
| Admin audit log | `admin-audit-log` | `requireRole(['admin'])` |
| Learner enrolment | `learner-enroll-course` | `requireRole(['learner'])` + must not already be enrolled |
| Learner progress summary | `learner-progress-summary` | Authenticated learner — own data only |

---

## Rule 3 — Role promotion is admin-only

No client endpoint allows a user to change their own role or another user's
role to `admin`. Role promotion to `admin` must be performed:

1. Via the Supabase dashboard by a super-admin, **or**
2. Via the `admin-set-role` edge function, which requires `requireRole(['admin'])`.

Signup is hardened by migration `027_signup_role_from_metadata.sql` — the
`handle_new_user()` trigger silently downgrades any attempt to sign up as
`admin` to `learner`.

---

## Canonical Classroom Model (E-1)

The `classes` table is the authoritative source for educator–student
relationships:

```
classes
  id           uuid PK
  educator_id  uuid → profiles.user_id
  name         text
  description  text

class_enrollments
  id          uuid PK
  class_id    uuid → classes.id
  student_id  uuid → profiles.user_id
  enrolled_at timestamptz
```

**Decision:** NeuroLearn uses the `classes` / `class_enrollments` model
(not a direct `educator_student_links` table). This allows:

- One educator to manage multiple classes
- One student to belong to multiple classes (different courses / educators)
- Clear ownership of who may view a student's progress

An educator may access a student's data only if `class_enrollments` contains a
row where `class_id` belongs to a class the educator owns
(`classes.educator_id = ctx.userId`).

---

## shared/authz.ts API

```ts
// Parse JWT + load caller role from profiles table.
authenticate(req: Request): Promise<AuthContext>

// Throw 403 if ctx.role is not in the allowed list.
requireRole(ctx, roles: UserRole[]): void

// Throw 403 if caller has no approved parent_student_links row for studentId.
requireParentOf(ctx, studentId: string): Promise<void>

// Throw 403 if caller has no class containing studentId.
requireEducatorOf(ctx, studentId: string): Promise<void>

// Throw 403 if caller is not the educator_id for classId.
requireClassOwner(ctx, classId: string): Promise<void>

// Throw 403 if caller is not the owner_id for the given course/lesson row.
requireContentOwner(ctx, table: 'courses'|'lessons', id: string): Promise<void>
```

---

## Developer checklist

Before merging any code that reads cross-user data:

- [ ] Query goes through an edge function, **not** a direct client query
- [ ] Edge function calls `authenticate()` first
- [ ] Appropriate `require*` guard is called before the privileged query
- [ ] Service-role client (`ctx.adminClient`) is used for the privileged query
- [ ] User-scoped client (`ctx.userClient`) is used for self-owned data only
- [ ] New function is listed in the table above
