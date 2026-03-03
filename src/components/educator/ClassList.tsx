import { useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { useClassManagement } from '../../hooks/useClassManagement'

export function ClassList() {
  const { classes, loading, error, createClass, updateClass, deleteClass } = useClassManagement()

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    setActionError(null)
    try {
      await createClass(newName.trim(), newDesc.trim() || undefined)
      setNewName('')
      setNewDesc('')
      setShowCreate(false)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to create class')
    }
  }, [newName, newDesc, createClass])

  const handleUpdate = useCallback(
    async (id: string) => {
      setActionError(null)
      try {
        await updateClass(id, { name: editName.trim(), description: editDesc.trim() })
        setEditingId(null)
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Failed to update class')
      }
    },
    [editName, editDesc, updateClass],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setActionError(null)
      try {
        await deleteClass(id)
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Failed to delete class')
      }
    },
    [deleteClass],
  )

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Your Classes</h2>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'New Class'}
        </Button>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {showCreate && (
        <Card>
          <div className="space-y-3">
            <Input
              label="Class Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create Class
            </Button>
          </div>
        </Card>
      )}

      {classes.length === 0 ? (
        <p className="text-slate-500">No classes yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => (
            <Card key={cls.id}>
              {editingId === cls.id ? (
                <div className="space-y-3">
                  <Input
                    label="Class Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(cls.id)} disabled={!editName.trim()}>
                      Save
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{cls.name}</h3>
                    {cls.description && <p className="text-sm text-slate-500">{cls.description}</p>}
                    <p className="text-xs text-slate-400">
                      Created {new Date(cls.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingId(cls.id)
                        setEditName(cls.name)
                        setEditDesc(cls.description ?? '')
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => handleDelete(cls.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
