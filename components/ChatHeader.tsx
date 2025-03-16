'use client';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/button';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const ChatHeader = ({ user }: { user: User | undefined }) => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase.channel('online-users', {
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
  }, [user]);

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

  return (
    <div className="h-20">
      <div className="border-b p-5 flex justify-between items-center h-full">
        <div>
          <h1 className="text-xl font-bold">Daily Chat</h1>

          {user && (
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
              <h1 className="text-sm text-gray-400">
                {onlineCount} online
              </h1>
            </div>
          )}
        </div>

        {user ? (
          <Button onClick={handleLogout}>LogOut</Button>
        ) : (
          <Button onClick={handleLoginWithGithub}>Login</Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;