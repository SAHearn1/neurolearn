import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'

interface AuditEntry {
  id: string
  actor_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  actor_name?: string
}

const PAGE_SIZE = 25

export function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('')

  const fetchEntries = useCallback(
    async (pageNum: number) => {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

        if (actionFilter) {
          query = query.eq('action', actionFilter)
        }

        const { data, error: err } = await query
        if (err) throw err

        const items = (data as AuditEntry[]) ?? []
        setHasMore(items.length === PAGE_SIZE)

        // Resolve actor names
        const actorIds = [...new Set(items.filter((e) => e.actor_id).map((e) => e.actor_id!))]
        if (actorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', actorIds)

          const nameMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]))
          for (const entry of items) {
            if (entry.actor_id) {
              entry.actor_name = nameMap.get(entry.actor_id) ?? 'Unknown'
            }
          }
        }

        setEntries(items)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load audit log')
      } finally {
        setLoading(false)
      }
    },
    [actionFilter],
  )

  useEffect(() => {
    fetchEntries(page)
  }, [page, fetchEntries])

  const exportCSV = useCallback(() => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Resource Type', 'Resource ID', 'Metadata']
    const rows = entries.map((e) => [
      new Date(e.created_at).toISOString(),
      e.actor_name ?? e.actor_id ?? 'system',
      e.action,
      e.resource_type,
      e.resource_id ?? '',
      e.metadata ? JSON.stringify(e.metadata) : '',
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Audit Log</h2>
        <Button variant="secondary" onClick={exportCSV} disabled={entries.length === 0}>
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2">
        {['', 'role_change', 'content_moderation', 'login', 'signup'].map((action) => (
          <button
            key={action}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              actionFilter === action
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => {
              setActionFilter(action)
              setPage(0)
            }}
          >
            {action || 'All'}
          </button>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {loading && <Spinner />}

      {!loading && entries.length === 0 && (
        <p className="text-slate-500">No audit log entries found.</p>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge>{entry.action}</Badge>
                  <span className="text-sm text-slate-700">
                    {entry.resource_type}
                    {entry.resource_id && ` #${entry.resource_id.slice(0, 8)}`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {entry.actor_name ?? entry.actor_id ?? 'System'} ·{' '}
                  {new Date(entry.created_at).toLocaleString()}
                  {entry.ip_address && ` · ${entry.ip_address}`}
                </p>
                {entry.metadata && (
                  <pre className="mt-1 text-xs text-slate-400 bg-slate-50 rounded p-1 overflow-x-auto">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-500 self-center">Page {page + 1}</span>
        <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
          Next
        </Button>
      </div>
    </section>
  )
}
