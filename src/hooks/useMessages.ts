import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface ChatMessage {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export function useMessages(_recipientId?: string) {
  const user = useAuthStore((s) => s.user)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (err) throw err
      setMessages((data as ChatMessage[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as ChatMessage, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const sendMessage = useCallback(
    async (toUserId: string, title: string, body: string) => {
      if (!user?.id) return

      const { error: err } = await supabase.from('notifications').insert({
        user_id: toUserId,
        type: 'info',
        title,
        body,
      })

      if (err) throw err
    },
    [user?.id],
  )

  const markAsRead = useCallback(async (messageId: string) => {
    const { error: err } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', messageId)

    if (err) throw err
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)))
  }, [])

  return {
    messages,
    unreadCount: messages.filter((m) => !m.read).length,
    loading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  }
}
