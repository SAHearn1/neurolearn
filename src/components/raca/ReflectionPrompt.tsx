import { useState } from 'react'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'

interface Props {
  prompt: string
  onSubmit: (reflection: string) => void
  minWords?: number
  placeholder?: string
}

export function ReflectionPrompt({
  prompt,
  onSubmit,
  minWords = 10,
  placeholder = 'Write your reflection here...',
}: Props) {
  const [text, setText] = useState('')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const canSubmit = wordCount >= minWords

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{prompt}</p>
      <textarea
        className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${canSubmit ? 'text-green-600' : 'text-slate-400'}`}>
          {wordCount} words {!canSubmit && `(minimum ${minWords})`}
        </span>
        <Button
          onClick={() => {
            onSubmit(text)
            setText('')
          }}
          disabled={!canSubmit}
        >
          Submit reflection
        </Button>
      </div>
      {!canSubmit && wordCount > 0 && (
        <Alert variant="info">
          Take your time. A thoughtful reflection helps deepen your learning.
        </Alert>
      )}
    </div>
  )
}
