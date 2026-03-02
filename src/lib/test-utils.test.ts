import { describe, expect, it, beforeEach } from 'vitest'
import {
  buildCourse,
  buildLesson,
  buildProfile,
  buildProgress,
  createMockSupabaseClient,
  resetTestIds,
} from './test-utils'

describe('test factories', () => {
  beforeEach(() => {
    resetTestIds()
  })

  it('builds a course with defaults', () => {
    const course = buildCourse()
    expect(course.id).toBe('test-0001')
    expect(course.status).toBe('published')
    expect(course.level).toBe('beginner')
  })

  it('applies overrides', () => {
    const course = buildCourse({ title: 'Custom', level: 'advanced' })
    expect(course.title).toBe('Custom')
    expect(course.level).toBe('advanced')
  })

  it('builds a lesson', () => {
    const lesson = buildLesson({ type: 'video' })
    expect(lesson.type).toBe('video')
    expect(lesson.course_id).toBe('course-001')
  })

  it('builds a profile', () => {
    const profile = buildProfile()
    expect(profile.display_name).toContain('Test User')
    expect(profile.accessibility.reduce_motion).toBe(false)
  })

  it('builds progress', () => {
    const progress = buildProgress({ status: 'completed' as const })
    expect(progress.status).toBe('completed')
  })

  it('generates unique IDs', () => {
    const a = buildCourse()
    const b = buildCourse()
    expect(a.id).not.toBe(b.id)
  })
})

describe('mock Supabase client', () => {
  it('creates a mock with expected methods', () => {
    const client = createMockSupabaseClient()
    expect(client.from).toBeDefined()
    expect(client.auth.signInWithPassword).toBeDefined()
    expect(client.auth.signUp).toBeDefined()
    expect(client.auth.signOut).toBeDefined()
    expect(client.auth.getSession).toBeDefined()
    expect(client.auth.resetPasswordForEmail).toBeDefined()
  })

  it('mock from() returns chainable query builder', () => {
    const client = createMockSupabaseClient()
    const query = client.from('profiles')
    expect(query.select).toBeDefined()
    expect(query.insert).toBeDefined()
    expect(query.update).toBeDefined()
    expect(query.eq).toBeDefined()
  })
})
