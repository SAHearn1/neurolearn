import type { Course, CourseLevel, CourseStatus } from '../types/course'
import type { Lesson, LessonType, LessonStatus } from '../types/lesson'
import type { UserProfile, AccessibilityPreferences } from '../types/profile'
import type { LessonProgress, ProgressStatus } from '../types/progress'

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `test-${idCounter.toString().padStart(4, '0')}`
}

export function resetTestIds(): void {
  idCounter = 0
}

// --- Factories ---

export function buildCourse(overrides?: Partial<Course>): Course {
  const id = nextId()
  return {
    id,
    title: `Test Course ${id}`,
    description: 'A test course for unit tests',
    level: 'beginner' as CourseLevel,
    status: 'published' as CourseStatus,
    thumbnail_url: null,
    lesson_count: 3,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

export function buildLesson(overrides?: Partial<Lesson>): Lesson {
  const id = nextId()
  return {
    id,
    course_id: 'course-001',
    title: `Test Lesson ${id}`,
    description: 'A test lesson for unit tests',
    type: 'text' as LessonType,
    status: 'published' as LessonStatus,
    content: 'Test lesson content',
    sort_order: 1,
    duration_minutes: 15,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

export function buildProfile(overrides?: Partial<UserProfile>): UserProfile {
  const id = nextId()
  return {
    id,
    user_id: `user-${id}`,
    display_name: `Test User ${id}`,
    avatar_url: null,
    role: 'learner',
    learning_styles: ['visual'],
    accessibility: buildAccessibility(),
    streak_days: 0,
    lessons_completed: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

export function buildAccessibility(
  overrides?: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  return {
    text_size: 'medium',
    reduce_motion: false,
    high_contrast: false,
    screen_reader_hints: false,
    ...overrides,
  }
}

export function buildProgress(
  overrides?: Partial<LessonProgress>,
): LessonProgress {
  const id = nextId()
  return {
    id,
    user_id: 'user-001',
    lesson_id: 'lesson-001',
    course_id: 'course-001',
    status: 'not_started' as ProgressStatus,
    score: null,
    time_spent_seconds: 0,
    completed_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// --- Supabase mock ---

export function createMockSupabaseClient() {
  const mockResponse = { data: null, error: null }

  const queryBuilder = {
    select: () => queryBuilder,
    insert: () => queryBuilder,
    update: () => queryBuilder,
    delete: () => queryBuilder,
    eq: () => queryBuilder,
    neq: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
    then: (resolve: (value: typeof mockResponse) => void) =>
      resolve(mockResponse),
  }

  return {
    from: (_table: string) => queryBuilder,
    auth: {
      signInWithPassword: () => Promise.resolve(mockResponse),
      signUp: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve(mockResponse),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    rpc: () => Promise.resolve(mockResponse),
  }
}
