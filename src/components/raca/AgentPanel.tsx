import { useState } from 'react'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { Alert } from '../ui/Alert'
import { AgentMessage } from './AgentMessage'
import type { AgentId, AgentDefinition, AgentResponse } from '../../lib/raca/types/agents'

interface Props {
  agents: AgentDefinition[]
  onInvoke: (agentId: AgentId, input: string) => Promise<AgentResponse | null>
  loading: boolean
  lastResponse: AgentResponse | null
  error: string | null
}

export function AgentPanel({ agents, onInvoke, loading, lastResponse, error }: Props) {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(
    agents.length === 1 ? agents[0].id : null,
  )

  const handleInvoke = async () => {
    if (!selectedAgent || !input.trim()) return
    await onInvoke(selectedAgent, input)
    setInput('')
  }

  if (agents.length === 0) {
    return (
      <Alert variant="info">
        No AI agents are available in this state. Focus on your own thinking first.
      </Alert>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        {agents.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAgent(a.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              selectedAgent === a.id
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {selectedAgent && (
        <p className="text-xs text-slate-500">
          {agents.find((a) => a.id === selectedAgent)?.description}
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the agent for help..."
          onKeyDown={(e) => e.key === 'Enter' && handleInvoke()}
          disabled={loading}
        />
        <Button onClick={handleInvoke} disabled={loading || !selectedAgent || !input.trim()}>
          {loading ? 'Thinking...' : 'Ask'}
        </Button>
      </div>

      {loading && <Spinner label="Agent is thinking..." />}
      {error && <Alert variant="error">{error}</Alert>}
      {lastResponse && <AgentMessage response={lastResponse} />}
    </div>
  )
}
