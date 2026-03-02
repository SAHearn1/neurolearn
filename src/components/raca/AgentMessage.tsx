import { Alert } from '../ui/Alert'
import type { AgentResponse } from '../../lib/raca/types/agents'

interface Props {
  response: AgentResponse
}

export function AgentMessage({ response }: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-brand-100 bg-brand-50 p-4">
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
    </div>
  )
}
