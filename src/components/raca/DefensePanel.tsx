import { useState } from 'react'
import { Button } from '../ui/Button'
import { VoiceInputButton } from '../ui/VoiceInputButton'
import type { AgentResponse } from '../../lib/raca/types/agents'

interface Props {
  agentQuestions: AgentResponse | null
  onSubmitDefense: (response: string) => void
}

export function DefensePanel({ agentQuestions, onSubmitDefense }: Props) {
  const [response, setResponse] = useState('')
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-4">
      {agentQuestions && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="mb-2 text-xs font-semibold text-red-700">Defense questions:</p>
          <div className="whitespace-pre-wrap text-sm text-red-800">{agentQuestions.content}</div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="defense-response" className="block text-sm font-medium text-slate-700">
          Defend your work — explain your reasoning and provide evidence
        </label>
        <textarea
          id="defense-response"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          rows={6}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Explain why you made the choices you did..."
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{wordCount} words</span>
            <VoiceInputButton
              onTranscript={(t) => setResponse((prev) => (prev.trim() ? `${prev} ${t}` : t))}
            />
          </div>
          <Button
            onClick={() => {
              onSubmitDefense(response)
              setResponse('')
            }}
            disabled={wordCount < 15}
          >
            Submit defense
          </Button>
        </div>
      </div>
    </div>
  )
}
