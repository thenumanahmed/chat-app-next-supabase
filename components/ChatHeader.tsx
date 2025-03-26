'use client';
import { createClient } from '@/lib/supabase/client';
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

        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
        {user ? (
          <div className="relative group">

            {/* USER INFO */}
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={user.user_metadata.avatar_url}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium max-w-25 truncate">
                {user.user_metadata.full_name}
              </span>
            </div>

            {/* DROPDOWN */}
            <div className="absolute right-0 mt-2 w-20 border rounded-lg shadow-lg 
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible 
              transition-all duration-200">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-900"
              >
                Logout
              </button>
            </div>

          </div>
        ) : (
          <button className='hover:bg-gray-900 border border-gray-700 rounded-md px-4 py-1'
            onClick={handleLoginWithGithub}>
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;