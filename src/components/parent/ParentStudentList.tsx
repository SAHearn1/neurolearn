import { useState, useCallback } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { Avatar } from '../ui/Avatar'
import { useParentStudentLinks } from '../../hooks/useParentStudentLinks'

export function ParentStudentList() {
  const { links, loading, error, linkStudent, updateLinkStatus } = useParentStudentLinks()
  const [studentId, setStudentId] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const handleLink = useCallback(async () => {
    if (!studentId.trim()) return
    setActionError(null)
    try {
      await linkStudent(studentId.trim())
      setStudentId('')
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to link student')
    }
  }, [studentId, linkStudent])

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">My Students</h2>

      <Card>
        <p className="text-sm font-medium text-slate-600 mb-2">Link a student by their user ID:</p>
        <div className="flex gap-2">
          <Input
            label="Student User ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter student's user ID"
          />
          <Button onClick={handleLink} disabled={!studentId.trim()} className="mt-6">
            Link
          </Button>
        </div>
        {actionError && <Alert variant="error" className="mt-2">{actionError}</Alert>}
      </Card>

      {links.length === 0 ? (
        <p className="text-slate-500">No linked students yet.</p>
      ) : (
        <div className="space-y-3">
          {links.map(({ link, student }) => (
            <Card key={link.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={student.display_name} />
                  <div>
                    <h3 className="font-semibold text-slate-900">{student.display_name}</h3>
                    <p className="text-sm text-slate-500">
                      {student.lessons_completed} lessons · {student.streak_days} day streak
                    </p>
                  </div>
                  <Badge>{link.status}</Badge>
                </div>
                <div className="flex gap-2">
                  {link.status === 'pending' && (
                    <Button variant="secondary" onClick={() => updateLinkStatus(link.id, 'active')}>
                      Approve
                    </Button>
                  )}
                  {link.status === 'active' && (
                    <Button variant="ghost" onClick={() => updateLinkStatus(link.id, 'revoked')}>
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
