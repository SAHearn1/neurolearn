/**
 * E2E Test Data Seed Script
 *
 * Creates the minimum user accounts and course data required to run
 * the Playwright E2E suite against a real Supabase instance.
 *
 * Usage:
 *   npx tsx scripts/seed-e2e.ts
 *
 * Required env vars (set in .env.local or export before running):
 *   SUPABASE_URL           — project URL (same as VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS for seeding)
 *
 * The script is idempotent — safe to re-run. Existing records are skipped.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Test account definitions ──────────────────────────────────────────────────

const TEST_ACCOUNTS = [
  {
    email: process.env.E2E_LEARNER_EMAIL ?? 'e2e-learner@neurolearn.test',
    password: process.env.E2E_LEARNER_PASSWORD ?? 'E2eTest!Learner1',
    role: 'learner',
    displayName: 'E2E Learner',
  },
  {
    email: process.env.E2E_EDUCATOR_EMAIL ?? 'e2e-educator@neurolearn.test',
    password: process.env.E2E_EDUCATOR_PASSWORD ?? 'E2eTest!Educator1',
    role: 'educator',
    displayName: 'E2E Educator',
  },
  {
    email: process.env.E2E_PARENT_EMAIL ?? 'e2e-parent@neurolearn.test',
    password: process.env.E2E_PARENT_PASSWORD ?? 'E2eTest!Parent1',
    role: 'parent',
    displayName: 'E2E Parent',
  },
  {
    email: process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@neurolearn.test',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'E2eTest!Admin1',
    role: 'admin',
    displayName: 'E2E Admin',
  },
]

// ── Seed functions ────────────────────────────────────────────────────────────

async function seedUsers(): Promise<Record<string, string>> {
  const userIds: Record<string, string> = {}
  console.log('\n── Users ────────────────────────────────')

  for (const account of TEST_ACCOUNTS) {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', account.displayName)
      .maybeSingle()

    if (existing) {
      console.log(`  ✓ ${account.role} already exists (${account.email})`)
      userIds[account.role] = existing.id
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { role: account.role },
    })

    if (error) {
      console.error(`  ✗ Failed to create ${account.role}:`, error.message)
      continue
    }

    const userId = data.user.id
    userIds[account.role] = userId

    // Upsert profile (profiles table uses user_id as the auth FK, not id)
    await supabase
      .from('profiles')
      .upsert(
        { user_id: userId, display_name: account.displayName, role: account.role },
        { onConflict: 'user_id' },
      )

    console.log(`  + Created ${account.role}: ${account.email} (${userId})`)
  }

  return userIds
}

async function seedCourses(): Promise<string[]> {
  console.log('\n── Courses ──────────────────────────────')
  const courseIds: string[] = []

  const courses = [
    {
      title: 'E2E Test Course — Reading Fundamentals',
      description: 'Seed course for E2E testing',
      difficulty: 'beginner',
      tags: ['reading', 'e2e-test'],
    },
    {
      title: 'E2E Test Course — Math Concepts',
      description: 'Seed course for E2E testing',
      difficulty: 'intermediate',
      tags: ['math', 'e2e-test'],
    },
  ]

  for (const course of courses) {
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('title', course.title)
      .maybeSingle()

    if (existing) {
      console.log(`  ✓ Course already exists: "${course.title}"`)
      courseIds.push(existing.id)
      continue
    }

    const { data, error } = await supabase.from('courses').insert(course).select('id').single()

    if (error) {
      console.error(`  ✗ Failed to create course "${course.title}":`, error.message)
      continue
    }

    courseIds.push(data.id)
    console.log(`  + Created course: "${course.title}" (${data.id})`)
  }

  return courseIds
}

async function seedLessons(courseIds: string[]): Promise<void> {
  console.log('\n── Lessons ──────────────────────────────')

  if (courseIds.length === 0) return

  const lessonsPerCourse = [
    [
      { title: 'Lesson 1 — Introduction', content_type: 'text', order_index: 1 },
      { title: 'Lesson 2 — Core Concepts', content_type: 'text', order_index: 2 },
      { title: 'Lesson 3 — Practice Quiz', content_type: 'interactive', order_index: 3 },
    ],
    [
      { title: 'Lesson 1 — Foundations', content_type: 'text', order_index: 1 },
      { title: 'Lesson 2 — Visual Walkthrough', content_type: 'video', order_index: 2 },
    ],
  ]

  for (let i = 0; i < courseIds.length; i++) {
    const courseId = courseIds[i]
    const lessons = lessonsPerCourse[i] ?? lessonsPerCourse[0]

    const { data: existing } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`  ✓ Lessons already exist for course ${courseId}`)
      continue
    }

    for (const lesson of lessons) {
      const { error } = await supabase.from('lessons').insert({
        ...lesson,
        course_id: courseId,
        content_body: `# ${lesson.title}\n\nThis is E2E test content for automated testing.`,
      })

      if (error) {
        console.error(`  ✗ Failed to create lesson "${lesson.title}":`, error.message)
      } else {
        console.log(`  + Created lesson: "${lesson.title}"`)
      }
    }
  }
}

async function seedClass(userIds: Record<string, string>, courseIds: string[]): Promise<void> {
  console.log('\n── Class & Enrollment ───────────────────')

  const educatorId = userIds['educator']
  const learnerId = userIds['learner']
  if (!educatorId || !learnerId) return

  const { data: existing } = await supabase
    .from('classes')
    .select('id')
    .eq('name', 'E2E Test Class')
    .maybeSingle()

  let classId: string

  if (existing) {
    console.log(`  ✓ Class already exists`)
    classId = existing.id
  } else {
    const { data, error } = await supabase
      .from('classes')
      .insert({ name: 'E2E Test Class', educator_id: educatorId })
      .select('id')
      .single()

    if (error || !data) {
      console.error('  ✗ Failed to create class:', error?.message)
      return
    }
    classId = data.id
    console.log(`  + Created class: E2E Test Class (${classId})`)
  }

  // Enroll learner
  const { data: enrollExisting } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', learnerId)
    .maybeSingle()

  if (!enrollExisting) {
    await supabase.from('class_enrollments').insert({
      class_id: classId,
      student_id: learnerId,
    })
    console.log(`  + Enrolled learner in class`)
  } else {
    console.log(`  ✓ Learner already enrolled`)
  }

  // Assign first course to class
  if (courseIds[0]) {
    const { data: assignExisting } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('class_id', classId)
      .eq('course_id', courseIds[0])
      .maybeSingle()

    if (!assignExisting) {
      await supabase
        .from('course_enrollments')
        .insert({ class_id: classId, course_id: courseIds[0] })
      console.log(`  + Assigned course to class`)
    } else {
      console.log(`  ✓ Course already assigned`)
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('NeuroLearn — E2E Seed Script')
  console.log(`Target: ${SUPABASE_URL}`)

  const userIds = await seedUsers()
  const courseIds = await seedCourses()
  await seedLessons(courseIds)
  await seedClass(userIds, courseIds)

  console.log('\n── Summary ──────────────────────────────')
  console.log('Seed complete. Test accounts:')
  for (const account of TEST_ACCOUNTS) {
    console.log(`  ${account.role.padEnd(10)} ${account.email}`)
  }
  console.log('\nTo run E2E tests:')
  console.log('  PLAYWRIGHT_RUN=true npm run test:e2e')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
