import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'

type UserRole = 'learner' | 'parent' | 'educator' | 'admin'

interface ManagedUser {
  user_id: string
  display_name: string
  role: UserRole
  created_at: string
  lessons_completed: number
  deleted_at: string | null
}

export function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, created_at, lessons_completed, deleted_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setUsers((data as ManagedUser[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('user_id', userId)

        if (err) throw err

        // Log to audit
        await supabase.from('audit_log').insert({
          action: 'role_change',
          resource_type: 'profile',
          resource_id: userId,
          metadata: { new_role: newRole },
        })

        await fetchUsers()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update role')
      }
    },
    [fetchUsers],
  )

  const softDelete = useCallback(
    async (userId: string) => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('profiles')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)

        if (err) throw err

        await supabase.from('audit_log').insert({
          action: 'user_deactivated',
          resource_type: 'profile',
          resource_id: userId,
          metadata: {},
        })

        await fetchUsers()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to deactivate user')
      }
    },
    [fetchUsers],
  )

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) return <Spinner />

  const roles: UserRole[] = ['learner', 'parent', 'educator', 'admin']

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">User Management</h2>

      <div className="flex flex-wrap gap-3">
        <Input
          label="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
        />
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Filter by role</p>
          <div className="flex gap-1">
            <button
              className={`rounded px-2 py-1 text-xs font-medium ${
                roleFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
              onClick={() => setRoleFilter('all')}
            >
              All
            </button>
            {roles.map((r) => (
              <button
                key={r}
                className={`rounded px-2 py-1 text-xs font-medium capitalize ${
                  roleFilter === r ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => setRoleFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <p className="text-sm text-slate-500">{filteredUsers.length} users found</p>

      <div className="space-y-2">
        {filteredUsers.map((u) => (
          <Card key={u.user_id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{u.display_name ?? 'Unnamed'}</h3>
                  <Badge>{u.role}</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Joined {new Date(u.created_at).toLocaleDateString()} · {u.lessons_completed} lessons
                </p>
              </div>
              <div className="flex items-center gap-1">
                {u.deleted_at && <Badge>Inactive</Badge>}
                {!u.deleted_at && roles
                  .filter((r) => r !== u.role)
                  .map((r) => (
                    <Button
                      key={r}
                      variant="ghost"
                      onClick={() => updateRole(u.user_id, r)}
                    >
                      Make {r}
                    </Button>
                  ))}
                {!u.deleted_at && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Deactivate ${u.display_name ?? 'this user'}?`)) {
                        softDelete(u.user_id)
                      }
                    }}
                    aria-label={`Deactivate ${u.display_name ?? 'user'}`}
                  >
                    Deactivate
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
