import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { racaFlags } from '../../lib/raca/feature-flags'

interface ReflectionActivityProps {
  content: string
  courseId?: string
  lessonId?: string
}

const SENTENCE_STARTERS = [
  'I think…',
  'I notice…',
  'A question I have is…',
  'I connect this to…',
  'Something surprising is…',
]

function extractPrompts(html: string): string[] {
  const div = document.createElement('div')
  div.innerHTML = html
  return Array.from(div.querySelectorAll('h2, h3'))
    .map((h) => h.textContent ?? '')
    .filter(Boolean)
}

export function ReflectionActivity({ content, courseId, lessonId }: ReflectionActivityProps) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const prompts = extractPrompts(content)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  if (submitted) {
    return (
      <div className="space-y-4 rounded-xl border border-brand-300 bg-brand-50 p-6">
        <p className="font-semibold text-brand-800">Reflection saved!</p>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{text}</p>
        {racaFlags.runtime && courseId && lessonId && (
          <Link to={`/courses/${courseId}/lessons/${lessonId}/session`}>
            <Button>Deepen this in a RACA Session →</Button>
          </Link>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            setText('')
            setSubmitted(false)
          }}
        >
          Write another reflection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {prompts.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700">Reflect on:</p>
          <ul className="list-disc pl-5 text-sm text-slate-600">
            {prompts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Sentence starters:</p>
        <div className="flex flex-wrap gap-2">
          {SENTENCE_STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => setText((t) => (t ? `${t} ${s}` : s))}
              className="rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs text-brand-700 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
        rows={6}
        placeholder="Write your reflection here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Reflection text"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <Button onClick={() => setSubmitted(true)} disabled={wordCount < 5}>
          Save Reflection
        </Button>
      </div>
    </div>
  )
}
