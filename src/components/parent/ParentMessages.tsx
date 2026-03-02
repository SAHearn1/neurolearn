import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { useAuthStore } from '../../store/authStore'
import { useParentStudentLinks } from '../../hooks/useParentStudentLinks'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  sender_name: string
}

export function ParentMessages() {
  const user = useAuthStore((s) => s.user)
  const { activeLinks } = useParentStudentLinks()
  const [educators, setEducators] = useState<{ id: string; name: string }[]>([])
  const [selectedEducatorId, setSelectedEducatorId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Find educators linked to the parent's children via class enrollments
  useEffect(() => {
    async function fetchEducators() {
      if (!activeLinks.length) return

      const studentIds = activeLinks.map((l) => l.link.student_id)

      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .in('student_id', studentIds)

      if (!enrollments?.length) return

      const classIds = [...new Set(enrollments.map((e) => e.class_id))]

      const { data: classes } = await supabase
        .from('classes')
        .select('educator_id')
        .in('id', classIds)

      if (!classes?.length) return

      const educatorIds = [...new Set(classes.map((c) => c.educator_id))]

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', educatorIds)

      setEducators(
        (profiles ?? []).map((p) => ({
          id: p.user_id,
          name: p.display_name ?? 'Educator',
        })),
      )
    }

    fetchEducators()
  }, [activeLinks])

  // Fetch messages with selected educator
  const fetchMessages = useCallback(async () => {
    if (!user?.id || !selectedEducatorId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .or(
          `and(user_id.eq.${user.id},type.eq.info),and(user_id.eq.${selectedEducatorId},type.eq.info)`,
        )
        .order('created_at', { ascending: true })
        .limit(50)

      if (err) throw err

      setMessages(
        (data ?? []).map((n) => ({
          id: n.id,
          sender_id: n.user_id,
          receiver_id: n.user_id === user.id ? selectedEducatorId : user.id,
          content: n.body ?? '',
          created_at: n.created_at,
          sender_name: n.user_id === user.id ? 'You' : 'Educator',
        })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedEducatorId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Supabase Realtime — subscribe to new notifications for the selected educator thread
  useEffect(() => {
    if (!user?.id || !selectedEducatorId) return

    // Clean up previous channel
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`messages:${user.id}:${selectedEducatorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void fetchMessages()
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [user?.id, selectedEducatorId, fetchMessages])

  const sendMessage = useCallback(async () => {
    if (!user?.id || !selectedEducatorId || !newMessage.trim()) return
    setError(null)
    try {
      // Use notifications table as a simple messaging mechanism
      const { error: err } = await supabase.from('notifications').insert({
        user_id: selectedEducatorId,
        type: 'info',
        title: 'Message from parent',
        body: newMessage.trim(),
      })

      if (err) throw err
      setNewMessage('')
      await fetchMessages()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
    }
  }, [user?.id, selectedEducatorId, newMessage, fetchMessages])

  if (!activeLinks.length) {
    return <p className="text-slate-500">Link a student first to message their educators.</p>
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Messages</h2>

      {educators.length === 0 ? (
        <p className="text-slate-500">No educators found for your linked students.</p>
      ) : (
        <>
          <div className="flex gap-2">
            {educators.map((edu) => (
              <button
                key={edu.id}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  selectedEducatorId === edu.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setSelectedEducatorId(edu.id)}
              >
                {edu.name}
              </button>
            ))}
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {loading && <Spinner />}

          {selectedEducatorId && (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.length === 0 && !loading && (
                  <p className="text-slate-500">No messages yet. Start a conversation.</p>
                )}
                {messages.map((m) => (
                  <Card
                    key={m.id}
                    className={m.sender_name === 'You' ? 'ml-8 bg-brand-50' : 'mr-8'}
                  >
                    <p className="text-xs font-medium text-slate-500">{m.sender_name}</p>
                    <p className="text-sm text-slate-700">{m.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
                  rows={2}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()} className="self-end">
                  Send
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
