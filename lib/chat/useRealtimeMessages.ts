'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMessages } from '@/lib/store/messages'
import { fetchUserProfile } from '@/lib/chat/messages'
import { toast } from 'sonner'
import type { Imessage } from '@/lib/store/messages'
import type { Tables } from '@/lib/database.types'
import type {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js'

const DEFAULT_PAGE_SIZE = 50
type MessageRow = Tables<'messages'>

export function useRealtimeMessages({
  roomId,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  roomId: string
  pageSize?: number
}) {
  const [page, setPage] = useState(1)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(true)

  const supabase = useMemo(() => createClient(), [])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const setMessages = useMessages((state) => state.setMessages)
  const prependMessages = useMessages((state) => state.prependMessages)
  const addMessage = useMessages((state) => state.addMessage)
  const optimisticDeleteMessage = useMessages((state) => state.optimisticDeleteMessage)
  const optimisticEditMessage = useMessages((state) => state.optimisticEditMessage)

  const loadPage = useCallback(
    async (pageToLoad: number, isOlderPage = false) => {
      if (!roomId) return
      if (loadingInitial || loadingOlder) return

      if (isOlderPage) {
        setLoadingOlder(true)
      } else {
        setLoadingInitial(true)
      }

      setError(null)

      const res = await fetch(
        `/api/messages?roomId=${encodeURIComponent(roomId)}&page=${pageToLoad}&pageSize=${pageSize}&direction=desc`
      )

      if (res.status === 401) {
        setIsAuth(false)
        setLoadingInitial(false)
        setLoadingOlder(false)
        return
      }

      if (!res.ok) {
        const body = await res.text()
        setError(`Error loading messages: ${body}`)
        setLoadingInitial(false)
        setLoadingOlder(false)
        return
      }

      const body = await res.json()

      if (body.error) {
        setError(body.error)
        setLoadingInitial(false)
        setLoadingOlder(false)
        return
      }

      const fetchedMessages = (body.messages ?? []) as Imessage[]
      const orderedMessages = [...fetchedMessages].reverse()

      if (pageToLoad === 1) {
        setMessages(orderedMessages)
      } else {
        prependMessages(orderedMessages)
      }

      setPage(pageToLoad)
      setHasMore(fetchedMessages.length === pageSize)

      setLoadingInitial(false)
      setLoadingOlder(false)
    },
    [loadingInitial, loadingOlder, pageSize, prependMessages, roomId, setMessages]
  )

  const loadOlder = useCallback(() => {
    if (!hasMore || loadingOlder || loadingInitial) return
    loadPage(page + 1, true)
  }, [hasMore, loadPage, loadingInitial, loadingOlder, page])

  useEffect(() => {
    setMessages([])
    setPage(1)
    setHasMore(true)
    setIsAuth(true)

    if (!roomId) return
    loadPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  useEffect(() => {
    if (!roomId) return

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase.channel(`room:${roomId}`)

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          try {
            const sender = await fetchUserProfile(supabase, payload.new.send_by)
            addMessage({
              ...payload.new,
              users: sender,
            })
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load message sender'
            toast.error(message)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresDeletePayload<MessageRow>) => {
          if (typeof payload.old.id === 'number') {
            optimisticDeleteMessage(payload.old.id)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresUpdatePayload<MessageRow>) => {
          optimisticEditMessage(payload.new)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addMessage, optimisticDeleteMessage, optimisticEditMessage, roomId, supabase])

  return {
    error,
    hasMore,
    isAuth,
    loadOlder,
    loadingInitial,
    loadingOlder,
  }
}
