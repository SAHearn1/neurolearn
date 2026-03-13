import { Alert } from '../ui/Alert'
import type { AgentResponse } from '../../lib/raca/types/agents'

interface Props {
  response: AgentResponse
  /** When true, displays Amara Keyes as the sender with branded avatar. */
  isAmara?: boolean
  /** Optional ISO timestamp to display below the message. */
  timestamp?: string
}

/**
 * AGY-04: AgentMessage with optional Amara Keyes persona display.
 * When isAmara is true, shows "Amara" as the sender name with an "AK" avatar.
 */
export function AgentMessage({ response, isAmara = false, timestamp }: Props) {
  const senderName = isAmara ? 'Amara' : 'Agent'
  const avatarLabel = isAmara ? 'AK' : 'AI'
  const avatarBg = isAmara ? 'bg-brand-500' : 'bg-slate-400'

  return (
    <article
      aria-label={`Message from ${senderName}`}
      className="space-y-2 rounded-lg border border-brand-100 bg-brand-50 p-4"
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${avatarBg}`}
          aria-hidden="true"
        >
          {avatarLabel}
        </span>
        <span className="text-xs font-semibold text-slate-700">{senderName}</span>
      </div>

      <div className="whitespace-pre-wrap text-sm text-slate-700">{response.content}</div>

      {response.reflective_questions.length > 0 && (
        <div className="border-t border-brand-200 pt-2">
          <p className="mb-1 text-xs font-semibold text-brand-700">Questions to consider:</p>
          <ul className="space-y-1">
            {response.reflective_questions.map((q, i) => (
              <li key={i} className="text-sm text-brand-600">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!response.constraint_check.passed && (
        <Alert variant="warning">
          Agent response was flagged: {response.constraint_check.violations.join('; ')}
        </Alert>
      )}

      {timestamp && (
        <p className="text-xs text-slate-400">
          {new Date(timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
    </article>
  )
}
