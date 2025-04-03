'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GENERAL_ROOM_ID } from '@/lib/chat/constants'
import { isValidUuid } from '@/lib/chat/uuid'
import CreateRoomButton from '@/components/CreateRoomButton'
import { cn } from '@/lib/utils'

export default function HomeLandingActions({ className }: { className?: string }) {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')

  const trimmed = useMemo(() => roomId.trim(), [roomId])
  const canJoin = trimmed.length > 0

  const joinRoom = () => {
    const value = trimmed
    if (!value) return

    if (value === GENERAL_ROOM_ID) {
      router.push('/general_chat')
      return
    }

    if (!isValidUuid(value)) {
      toast.error('Invalid room id')
      return
    }

    router.push(`/chat/${value}`)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button variant="outline" onClick={() => router.push('/general_chat')}>
          Join General Chat
        </Button>
        <CreateRoomButton />
      </div>

      <div className="self-center max-w-sm">
        <Input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter meeting code / room id (UUID)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              joinRoom()
            }
          }}
        />
        <Button onClick={joinRoom} disabled={!canJoin} className="w-full mt-2">
          Join Room
        </Button>
      </div>
    </div>
  )
}
