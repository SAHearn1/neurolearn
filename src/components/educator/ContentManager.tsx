import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'
import type { Course } from '../../types/course'
import type { Lesson } from '../../types/lesson'

type ContentTab = 'courses' | 'lessons'

const RACA_PHASES = [
  'ROOT',
  'REGULATE',
  'POSITION',
  'PLAN',
  'APPLY',
  'REVISE',
  'DEFEND',
  'RECONNECT',
  'ARCHIVE',
] as const

const TRACE_DIMENSIONS = [
  { key: 'think', label: 'Think' },
  { key: 'reason', label: 'Reason' },
  { key: 'articulate', label: 'Articulate' },
  { key: 'check', label: 'Check' },
  { key: 'extend', label: 'Extend' },
  { key: 'ethical', label: 'Ethical' },
] as const

type TraceDimKey = (typeof TRACE_DIMENSIONS)[number]['key']

type SessionDepth = 'introductory' | 'developing' | 'advanced'

interface RacaConfig {
  target_dims: TraceDimKey[]
  defend_prompt: string
  position_seed: string
  session_depth: SessionDepth | ''
  artifact_criteria: string
}

const EMPTY_RACA_CONFIG: RacaConfig = {
  target_dims: [],
  defend_prompt: '',
  position_seed: '',
  session_depth: '',
  artifact_criteria: '',
}

/** Reusable Cognitive Design sub-form for lesson create/edit */
function CognitiveDesignFields({
  config,
  onChange,
}: {
  config: RacaConfig
  onChange: (c: RacaConfig) => void
}) {
  const toggleDim = (key: TraceDimKey) => {
    const dims = config.target_dims.includes(key)
      ? config.target_dims.filter((d) => d !== key)
      : [...config.target_dims, key]
    onChange({ ...config, target_dims: dims })
  }

  return (
    <details className="rounded-xl border border-slate-200">
      <summary className="cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Cognitive Design (optional)
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3">
        {/* Target TRACE dimensions */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600">
            Target TRACE dimensions
            <span className="ml-1 font-normal text-slate-400">
              — Which thinking skills does this lesson develop?
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TRACE_DIMENSIONS.map(({ key, label }) => {
              const on = config.target_dims.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDim(key)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    on
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* DEFEND prompt */}
        <div>
          <label
            htmlFor="raca-defend-prompt"
            className="block text-xs font-semibold text-slate-600"
          >
            DEFEND prompt
            <span className="ml-1 font-normal text-slate-400">
              — Question learners must defend in the DEFEND state
            </span>
          </label>
          <textarea
            id="raca-defend-prompt"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
            rows={2}
            placeholder="e.g. Explain in your own words why photosynthesis is essential for life on Earth"
            value={config.defend_prompt}
            onChange={(e) => onChange({ ...config, defend_prompt: e.target.value })}
          />
        </div>

        {/* POSITION seed */}
        <div>
          <label
            htmlFor="raca-position-seed"
            className="block text-xs font-semibold text-slate-600"
          >
            POSITION seed
            <span className="ml-1 font-normal text-slate-400">
              — Framing question shown at the start of POSITION state (optional)
            </span>
          </label>
          <textarea
            id="raca-position-seed"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
            rows={2}
            placeholder="e.g. What do you already know or believe about this topic?"
            value={config.position_seed}
            onChange={(e) => onChange({ ...config, position_seed: e.target.value })}
          />
        </div>

        {/* Session depth */}
        <div>
          <label
            htmlFor="raca-session-depth"
            className="block text-xs font-semibold text-slate-600"
          >
            Session depth
          </label>
          <select
            id="raca-session-depth"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
            value={config.session_depth}
            onChange={(e) =>
              onChange({ ...config, session_depth: e.target.value as SessionDepth | '' })
            }
          >
            <option value="">Select depth…</option>
            <option value="introductory">Introductory</option>
            <option value="developing">Developing</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Artifact criteria */}
        <div>
          <label
            htmlFor="raca-artifact-criteria"
            className="block text-xs font-semibold text-slate-600"
          >
            Artifact criteria
            <span className="ml-1 font-normal text-slate-400">
              — What does a strong artifact look like? (educator reference only, not shown to
              learners)
            </span>
          </label>
          <textarea
            id="raca-artifact-criteria"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
            rows={3}
            placeholder="e.g. A strong response will include a clear definition, one real-world example, and an explanation of cause-and-effect."
            value={config.artifact_criteria}
            onChange={(e) => onChange({ ...config, artifact_criteria: e.target.value })}
          />
        </div>
      </div>
    </details>
  )
}

/** Returns null when the config contains no meaningful data (avoid storing empty JSONB) */
function buildRacaConfigPayload(config: RacaConfig): RacaConfig | null {
  if (
    config.target_dims.length > 0 ||
    config.defend_prompt ||
    config.position_seed ||
    config.session_depth ||
    config.artifact_criteria
  ) {
    return config
  }
  return null
}

export function ContentManager() {
  const [tab, setTab] = useState<ContentTab>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Course form state
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')

  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonRacaPhase, setLessonRacaPhase] = useState('')
  const [lessonRacaConfig, setLessonRacaConfig] = useState<RacaConfig>(EMPTY_RACA_CONFIG)

  // Lesson edit state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editRacaPhase, setEditRacaPhase] = useState('')
  const [editRacaConfig, setEditRacaConfig] = useState<RacaConfig>(EMPTY_RACA_CONFIG)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setCourses((data as Course[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLessons = useCallback(async (courseId: string) => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true })

      if (err) throw err
      setLessons((data as Lesson[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (selectedCourseId) fetchLessons(selectedCourseId)
  }, [selectedCourseId, fetchLessons])

  const createCourse = useCallback(async () => {
    if (!courseTitle.trim()) return
    setError(null)
    try {
      const { error: err } = await supabase.from('courses').insert({
        title: courseTitle.trim(),
        description: courseDesc.trim() || null,
        status: 'draft',
        level: 'beginner',
        lesson_count: 0,
      })

      if (err) throw err
      setCourseTitle('')
      setCourseDesc('')
      setShowCourseForm(false)
      await fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create course')
    }
  }, [courseTitle, courseDesc, fetchCourses])

  const updateCourseStatus = useCallback(
    async (courseId: string, status: 'draft' | 'published' | 'archived') => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('courses')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', courseId)

        if (err) throw err
        await fetchCourses()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update course')
      }
    },
    [fetchCourses],
  )

  const createLesson = useCallback(async () => {
    if (!selectedCourseId || !lessonTitle.trim()) return
    setError(null)
    try {
      const nextOrder = lessons.length + 1
      const racaConfigPayload = buildRacaConfigPayload(lessonRacaConfig)
      const { error: err } = await supabase.from('lessons').insert({
        course_id: selectedCourseId,
        title: lessonTitle.trim(),
        description: lessonDesc.trim() || null,
        content: lessonContent.trim() || null,
        sort_order: nextOrder,
        status: 'draft',
        type: 'text',
        duration_minutes: 15,
        raca_phase: lessonRacaPhase || null,
        raca_config: racaConfigPayload,
      })

      if (err) throw err
      setLessonTitle('')
      setLessonDesc('')
      setLessonContent('')
      setLessonRacaPhase('')
      setLessonRacaConfig(EMPTY_RACA_CONFIG)
      setShowLessonForm(false)
      await fetchLessons(selectedCourseId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create lesson')
    }
  }, [
    selectedCourseId,
    lessonTitle,
    lessonDesc,
    lessonContent,
    lessonRacaPhase,
    lessonRacaConfig,
    lessons.length,
    fetchLessons,
  ])

  const saveEditLesson = useCallback(async () => {
    if (!editingLessonId || !editTitle.trim() || !selectedCourseId) return
    setError(null)
    try {
      const racaConfigPayload = buildRacaConfigPayload(editRacaConfig)
      const { error: err } = await supabase
        .from('lessons')
        .update({
          title: editTitle.trim(),
          content: editContent.trim() || null,
          raca_phase: editRacaPhase || null,
          raca_config: racaConfigPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingLessonId)

      if (err) throw err
      setEditingLessonId(null)
      setEditTitle('')
      setEditContent('')
      setEditRacaPhase('')
      setEditRacaConfig(EMPTY_RACA_CONFIG)
      await fetchLessons(selectedCourseId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update lesson')
    }
  }, [
    editingLessonId,
    editTitle,
    editContent,
    editRacaPhase,
    editRacaConfig,
    selectedCourseId,
    fetchLessons,
  ])

  const publishLesson = useCallback(
    async (lessonId: string, status: 'published' | 'draft' | 'archived') => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('lessons')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', lessonId)

        if (err) throw err
        if (selectedCourseId) await fetchLessons(selectedCourseId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update lesson status')
      }
    },
    [selectedCourseId, fetchLessons],
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Content Management</h2>
        <div className="flex gap-2">
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === 'courses' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setTab('courses')}
          >
            Courses
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === 'lessons' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setTab('lessons')}
          >
            Lessons
          </button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {loading && <Spinner />}

      {tab === 'courses' && (
        <div className="space-y-3">
          <Button onClick={() => setShowCourseForm(!showCourseForm)}>
            {showCourseForm ? 'Cancel' : 'New Course'}
          </Button>

          {showCourseForm && (
            <Card>
              <div className="space-y-3">
                <Input
                  label="Course Title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
                <Input
                  label="Description"
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                />
                <Button onClick={createCourse} disabled={!courseTitle.trim()}>
                  Create Course
                </Button>
              </div>
            </Card>
          )}

          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    <Badge>{course.status}</Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-slate-500">{course.description}</p>
                  )}
                  <p className="text-xs text-slate-400">{course.lesson_count} lessons</p>
                </div>
                <div className="flex gap-2">
                  {course.status === 'draft' && (
                    <Button
                      variant="secondary"
                      onClick={() => updateCourseStatus(course.id, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {course.status === 'published' && (
                    <Button
                      variant="secondary"
                      onClick={() => updateCourseStatus(course.id, 'archived')}
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCourseId(course.id)
                      setTab('lessons')
                    }}
                  >
                    Manage Lessons
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'lessons' && (
        <div className="space-y-3">
          {!selectedCourseId ? (
            <p className="text-slate-500">Select a course to manage its lessons.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">
                  Lessons for: {courses.find((c) => c.id === selectedCourseId)?.title}
                </p>
                <Button onClick={() => setShowLessonForm(!showLessonForm)}>
                  {showLessonForm ? 'Cancel' : 'New Lesson'}
                </Button>
              </div>

              {showLessonForm && (
                <Card>
                  <div className="space-y-3">
                    <Input
                      label="Lesson Title"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                    />
                    <Input
                      label="Description"
                      value={lessonDesc}
                      onChange={(e) => setLessonDesc(e.target.value)}
                    />
                    <label className="block text-sm font-medium text-slate-700">
                      Content
                      <textarea
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                        rows={6}
                        value={lessonContent}
                        onChange={(e) => setLessonContent(e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      RACA Phase
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                        value={lessonRacaPhase}
                        onChange={(e) => setLessonRacaPhase(e.target.value)}
                      >
                        <option value="">General (any state)</option>
                        {RACA_PHASES.map((phase) => (
                          <option key={phase} value={phase}>
                            {phase}
                          </option>
                        ))}
                      </select>
                    </label>
                    <CognitiveDesignFields
                      config={lessonRacaConfig}
                      onChange={setLessonRacaConfig}
                    />
                    <Button onClick={createLesson} disabled={!lessonTitle.trim()}>
                      Create Lesson
                    </Button>
                  </div>
                </Card>
              )}

              {lessons.length === 0 && !loading && (
                <p className="text-slate-500">No lessons yet for this course.</p>
              )}

              {lessons.map((lesson) => (
                <Card key={lesson.id}>
                  {editingLessonId === lesson.id ? (
                    <div className="space-y-3">
                      <Input
                        label="Title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <label className="block text-sm font-medium text-slate-700">
                        Content
                        <textarea
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                          rows={4}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        RACA Phase
                        <select
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                          value={editRacaPhase}
                          onChange={(e) => setEditRacaPhase(e.target.value)}
                        >
                          <option value="">General (any state)</option>
                          {RACA_PHASES.map((phase) => (
                            <option key={phase} value={phase}>
                              {phase}
                            </option>
                          ))}
                        </select>
                      </label>
                      <CognitiveDesignFields config={editRacaConfig} onChange={setEditRacaConfig} />
                      <div className="flex gap-2">
                        <Button onClick={saveEditLesson} disabled={!editTitle.trim()}>
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingLessonId(null)
                            setEditTitle('')
                            setEditContent('')
                            setEditRacaConfig(EMPTY_RACA_CONFIG)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400">
                            #{lesson.sort_order}
                          </span>
                          <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                          <Badge>{lesson.status}</Badge>
                          <Badge>{lesson.type}</Badge>
                          {lesson.raca_phase && <Badge>{lesson.raca_phase}</Badge>}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-slate-500">{lesson.description}</p>
                        )}
                        <p className="text-xs text-slate-400">{lesson.duration_minutes} min</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingLessonId(lesson.id)
                            setEditTitle(lesson.title)
                            setEditContent(lesson.content ?? '')
                            setEditRacaPhase(lesson.raca_phase ?? '')
                            const rc = (lesson as { raca_config?: RacaConfig | null }).raca_config
                            setEditRacaConfig(rc ?? EMPTY_RACA_CONFIG)
                          }}
                        >
                          Edit
                        </Button>
                        {lesson.status === 'draft' && (
                          <Button
                            variant="secondary"
                            onClick={() => publishLesson(lesson.id, 'published')}
                          >
                            Publish
                          </Button>
                        )}
                        {lesson.status === 'published' && (
                          <Button variant="ghost" onClick={() => publishLesson(lesson.id, 'draft')}>
                            Unpublish
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  )
}
