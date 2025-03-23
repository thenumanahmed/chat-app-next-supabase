'use client'

import { useEffect, useState } from 'react'
import MessagesList from './MessagesList'
import { useMessages } from '@/lib/store/messages'

const PAGE_SIZE = 20

const ChatMessages = () => {
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(true)

  const messages = useMessages((state) => state.messages)

  const loadPage = async (pageToLoad: number, isOlderPage = false) => {
    if (loading || loadingOlder) return

    if (isOlderPage) {
      setLoadingOlder(true)
    } else {
      setLoading(true)
    }

    setError(null)

    const res = await fetch(`/api/messages?page=${pageToLoad}&pageSize=${PAGE_SIZE}&direction=desc`)

    if (res.status === 401) {
      setIsAuth(false)
      setLoading(false)
      setLoadingOlder(false)
      return
    }

    if (!res.ok) {
      const body = await res.text()
      setError(`Error loading messages: ${body}`)
      setLoading(false)
      setLoadingOlder(false)
      return
    }

    const body = await res.json()

    if (body.error) {
      setError(body.error)
      setLoading(false)
      setLoadingOlder(false)
      return
    }

    const fetchedMessages = (body.messages ?? []) as any[]
    const orderedMessages = [...fetchedMessages].reverse()

    if (pageToLoad === 1) {
      useMessages.getState().setMessages(orderedMessages)
    } else {
      useMessages.getState().prependMessages(orderedMessages)
    }

    setPage(pageToLoad)
    setTotalCount(body.totalCount ?? 0)
    setHasMore(fetchedMessages.length === PAGE_SIZE)

    setLoading(false)
    setLoadingOlder(false)
  }

  useEffect(() => {
    loadPage(1)
  }, [])

  const loadOlder = () => {
    if (!hasMore || loadingOlder || loading) return
    loadPage(page + 1, true)
  }

  if (!isAuth) {
    return <div>Please log in</div>
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {error && <div className="shrink-0 p-4 text-red-600">{error}</div>}

      <MessagesList
        onLoadPrevious={loadOlder}
        loadingPrevious={loadingOlder}
        hasMorePrevious={hasMore}
      />
    </div>
  )
}

export default ChatMessages
