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

// Environment guard — prevent accidental seeding of production
const PROD_URL_PATTERN = /supabase\.co/
if (PROD_URL_PATTERN.test(SUPABASE_URL) && !process.env.ALLOW_PROD_SEED) {
  console.error(
    '\n⛔  BLOCKED: SUPABASE_URL appears to point at a hosted Supabase instance.',
    '\n   This script is for local / CI environments only.',
    '\n   If you intentionally need to seed a hosted instance, set ALLOW_PROD_SEED=true.',
    '\n   URL:',
    SUPABASE_URL,
  )
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
      title: 'Reading Fundamentals',
      description:
        'Build core reading skills with accessible, multimodal lessons designed for every learner.',
      level: 'beginner',
      status: 'published',
    },
    {
      title: 'Math Concepts',
      description:
        'Explore foundational math ideas through visual walkthroughs, practice, and real-world connections.',
      level: 'intermediate',
      status: 'published',
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
      {
        title: 'Introduction to Reading',
        type: 'text',
        sort_order: 1,
        content: `# Introduction to Reading\n\nReading is one of the most powerful tools you have. It opens doors to ideas, stories, and knowledge from every corner of the world.\n\nIn this lesson, we will explore what strong readers do and how you can build those same habits — at your own pace, in your own way.\n\n## What strong readers do\n\n- They **connect** what they read to things they already know\n- They **ask questions** as they go (not just at the end)\n- They **slow down** when something is confusing — that's a sign to pay closer attention\n- They **visualise** — creating a mental picture of what is happening\n\n## Try it now\n\nBefore moving on, take a moment. Think of a time you read something that surprised you. What made it stick in your memory?\n\nThere is no right answer. The goal is to notice what reading feels like for *you*.`,
      },
      {
        title: 'Core Concepts: Decoding and Fluency',
        type: 'text',
        sort_order: 2,
        content: `# Core Concepts: Decoding and Fluency\n\nDecoding means translating printed letters into words. Fluency means reading smoothly enough that your brain has space to understand, not just decode.\n\n## Decoding strategies\n\n**Sound it out** — break the word into smaller parts (syl-la-bles).\n\n**Look for patterns** — words like *bright*, *night*, and *might* all follow the same pattern.\n\n**Use context** — if you are unsure of a word, read the whole sentence. The meaning of nearby words often reveals it.\n\n## Building fluency\n\nFluency grows with practice. It does not mean reading fast — it means reading at a pace that feels natural and clear.\n\n> Re-reading a short passage two or three times builds fluency faster than reading something new each time.\n\n## Check your understanding\n\nWhat is the difference between decoding and fluency? Write one sentence in your own words before continuing.`,
      },
      {
        title: 'Practice: Reading Comprehension',
        type: 'interactive',
        sort_order: 3,
        content: `# Practice: Reading Comprehension\n\nRead the short passage below, then answer the questions that follow.\n\n---\n\n*Maya sat by the window, watching the rain streak down the glass. She had been trying to read the same page for twenty minutes. Every time she got to the third paragraph, her mind wandered to tomorrow's presentation.*\n\n*She closed the book, took three slow breaths, and decided to try something different: she would read just one sentence at a time, and after each one, she would say what it meant in her own words.*\n\n*By the time the rain stopped, she had finished the chapter.*\n\n---\n\n[CHECK]\nquestion: Why did Maya change her reading strategy?\na: She finished the chapter too quickly\nb: Her mind kept wandering when she tried to read a full page\nc: She wanted to read faster\nd: The book was too easy\ncorrect: b\nexplanation: Maya noticed she could not focus on the full page, so she broke it into smaller steps — one sentence at a time.\n[/CHECK]`,
      },
    ],
    [
      {
        title: 'Foundations of Number Sense',
        type: 'text',
        sort_order: 1,
        content: `# Foundations of Number Sense\n\nNumber sense is the ability to understand, relate, and connect numbers — not just memorise them. It is the foundation everything else in maths is built on.\n\n## What is number sense?\n\nNumber sense means you can:\n- Estimate whether an answer is reasonable before calculating\n- Understand that **7 + 5 = 12** is the same as **5 + 7 = 12** (and why)\n- Break numbers apart to make calculations easier: **8 × 7 = (8 × 5) + (8 × 2)**\n\n## Why it matters\n\nStudents with strong number sense make fewer errors — not because they are more careful, but because they can *feel* when something is wrong.\n\nIf you calculate 23 × 4 and get 512, number sense tells you immediately: that is too big. 23 × 4 should be around 90.\n\n## Build it now\n\nWithout a calculator, estimate: roughly how many seconds are in a day?\n\nDon't try to be exact. Use what you know: 60 seconds in a minute, 60 minutes in an hour, 24 hours in a day. Round as you go.`,
      },
      {
        title: 'Visual Walkthrough: Fractions',
        type: 'video',
        sort_order: 2,
        content: `# Visual Walkthrough: Fractions\n\nFractions describe parts of a whole. Before we look at rules and procedures, let's build a picture.\n\n## Seeing fractions\n\nImagine a pizza cut into 8 equal slices. If you eat 3 slices, you have eaten **3/8** of the pizza.\n\n- The **bottom number** (denominator) tells you how many equal parts the whole is divided into\n- The **top number** (numerator) tells you how many parts you have\n\n## Common misconception\n\nMany students think a bigger denominator means a bigger fraction. It is actually the opposite.\n\n- 1/2 is larger than 1/8 — because each piece of a pizza cut into 2 is much bigger than each piece cut into 8\n\n## Equivalent fractions\n\n**1/2 = 2/4 = 4/8** — these all describe the same amount, just divided differently.\n\nThink of folding a piece of paper: fold it once → 2 equal parts (1/2). Fold again → 4 equal parts (2/4). The shaded area has not changed.\n\n## Try it\n\nDraw a rectangle. Shade 3/4 of it. Now divide each section in half. How many sections are shaded out of the total? What fraction is that?`,
      },
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
    .eq('name', 'Spring 2026 Cohort')
    .maybeSingle()

  let classId: string

  if (existing) {
    console.log(`  ✓ Class already exists`)
    classId = existing.id
  } else {
    const { data, error } = await supabase
      .from('classes')
      .insert({ name: 'Spring 2026 Cohort', educator_id: educatorId })
      .select('id')
      .single()

    if (error || !data) {
      console.error('  ✗ Failed to create class:', error?.message)
      return
    }
    classId = data.id
    console.log(`  + Created class: Spring 2026 Cohort (${classId})`)
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
