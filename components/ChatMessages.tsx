'use client'

import MessagesList from './MessagesList'
import { useRealtimeMessages } from '@/lib/chat/useRealtimeMessages'

const ChatMessages = ({ roomId }: { roomId: string }) => {
  const { error, hasMore, isAuth, loadOlder, loadingOlder } = useRealtimeMessages({
    roomId,
  })

  if (!isAuth) {
    return <div className="p-4 text-sm text-muted-foreground">Please log in</div>
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {error && <div className="shrink-0 p-4 text-destructive">{error}</div>}
      {!roomId && (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Join “General Chat” or create a room to start.
        </div>
      )}

      {roomId && (
        <MessagesList
          onLoadPrevious={loadOlder}
          loadingPrevious={loadingOlder}
          hasMorePrevious={hasMore}
        />
      )}
    </div>
  )
}

export default ChatMessages
