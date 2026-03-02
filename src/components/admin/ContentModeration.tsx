import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'

interface ModerationItem {
  id: string
  type: 'course' | 'lesson'
  title: string
  status: string
  created_at: string
  description: string | null
}

export function ContentModeration() {
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: courses, error: cErr } = await supabase
        .from('courses')
        .select('id, title, status, created_at, description')
        .order('created_at', { ascending: false })

      if (cErr) throw cErr

      const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, title, status, created_at, description')
        .order('created_at', { ascending: false })
        .limit(50)

      if (lErr) throw lErr

      const all: ModerationItem[] = [
        ...(courses ?? []).map((c) => ({
          id: c.id,
          type: 'course' as const,
          title: c.title,
          status: c.status,
          created_at: c.created_at,
          description: c.description,
        })),
        ...(lessons ?? []).map((l) => ({
          id: l.id,
          type: 'lesson' as const,
          title: l.title,
          status: l.status,
          created_at: l.created_at,
          description: l.description,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setItems(all)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const updateStatus = useCallback(
    async (item: ModerationItem, newStatus: string) => {
      setError(null)
      try {
        const table = item.type === 'course' ? 'courses' : 'lessons'
        const { error: err } = await supabase
          .from(table)
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', item.id)

        if (err) throw err

        await supabase.from('audit_log').insert({
          action: 'content_moderation',
          resource_type: item.type,
          resource_id: item.id,
          metadata: { old_status: item.status, new_status: newStatus },
        })

        await fetchContent()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update content status')
      }
    },
    [fetchContent],
  )

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.status === filter)

  if (loading) return <Spinner />

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Content Moderation</h2>

      <div className="flex gap-2">
        {(['all', 'draft', 'published', 'archived'] as const).map((f) => (
          <button
            key={f}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <p className="text-sm text-slate-500">{filteredItems.length} items</p>

      <div className="space-y-2">
        {filteredItems.map((item) => (
          <Card key={`${item.type}-${item.id}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge>{item.type}</Badge>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <Badge>{item.status}</Badge>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                )}
                <p className="text-xs text-slate-400">
                  Created {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                {item.status === 'draft' && (
                  <Button variant="secondary" onClick={() => updateStatus(item, 'published')}>
                    Publish
                  </Button>
                )}
                {item.status === 'published' && (
                  <>
                    <Button variant="secondary" onClick={() => updateStatus(item, 'draft')}>
                      Unpublish
                    </Button>
                    <Button variant="ghost" onClick={() => updateStatus(item, 'archived')}>
                      Archive
                    </Button>
                  </>
                )}
                {item.status === 'archived' && (
                  <Button variant="secondary" onClick={() => updateStatus(item, 'draft')}>
                    Restore
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
