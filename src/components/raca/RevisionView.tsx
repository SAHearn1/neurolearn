import { DraftEditor } from './DraftEditor'
import type { Artifact } from '../../lib/raca/types/artifacts'

interface Props {
  originalDraft: Artifact | undefined
  onSaveRevision: (content: string) => void
}

export function RevisionView({ originalDraft, onSaveRevision }: Props) {
  return (
    <div className="space-y-4">
      {originalDraft && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">Your original draft:</p>
          <div className="whitespace-pre-wrap text-sm text-slate-700">{originalDraft.content}</div>
          <p className="mt-2 text-xs text-slate-400">{originalDraft.word_count} words</p>
        </div>
      )}

      <DraftEditor
        label="Revise your work based on the critique"
        initialContent={originalDraft?.content ?? ''}
        onSave={onSaveRevision}
        placeholder="Revise and strengthen your draft..."
      />
    </div>
  )
}
