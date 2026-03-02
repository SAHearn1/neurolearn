import { useState } from 'react'
import { Button } from '../ui/Button'

interface Props {
  initialContent?: string
  onSave: (content: string) => void
  label: string
  placeholder?: string
}

export function DraftEditor({
  initialContent = '',
  onSave,
  label,
  placeholder = 'Start writing your response...',
}: Props) {
  const [content, setContent] = useState(initialContent)
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{wordCount} words</span>
        <Button onClick={() => onSave(content)} disabled={wordCount < 5}>
          Save draft
        </Button>
      </div>
    </div>
  )
}
