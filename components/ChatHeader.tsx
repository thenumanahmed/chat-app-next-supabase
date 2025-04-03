'use client';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GENERAL_ROOM_ID } from '@/lib/chat/constants';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ChatHeader = ({
  user,
  roomId,
}: {
  user: User | undefined;
  roomId?: string;
}) => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user || !roomId) return;

    setOnlineCount(0);
    const supabase = createClient();

    const channel = supabase.channel(`presence:room:${roomId}`, {
      config: {
        presence: {
          key: user.id, // unique per user
        },
      },
    });

    // Listen to presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.keys(state);
      setOnlineCount(users.length);
    });

    // Join + track yourself
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          email: user.email,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  const handleLoginWithGithub = () => {
    const client = createClient();
    client.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: location.origin + '/auth/callback',
      }
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    location.reload();
  };

  const hasRoomContext = Boolean(roomId);
  const isGeneral = roomId === GENERAL_ROOM_ID;
  const showGeneralLink = hasRoomContext && !isGeneral;

  return (
    <div className="h-20">
      <div className="border-b p-5 flex justify-between items-center h-full">

        {/* LEFT SIDE */}
        <div>
          <h1 className="text-xl font-bold">Daily Chat</h1>

          {user && (
            <div className="flex items-center gap-3">
              {hasRoomContext && (
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                  <h1 className="text-sm text-muted-foreground">{onlineCount} online</h1>
                </div>
              )}

              {showGeneralLink && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/general_chat">General Chat</Link>
                </Button>
              )}

              {hasRoomContext && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">Exit</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-2 gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      className="h-7 w-7 rounded-full"
                      width={28}
                      height={28}
                      alt={user.user_metadata?.full_name ?? "User avatar"}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted" />
                  )}
                  <span className="text-sm font-medium max-w-32 truncate">
                    {user.user_metadata?.full_name ?? user.email ?? "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={handleLoginWithGithub}>
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
