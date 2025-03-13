'use client';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/button'
import { User } from '@supabase/supabase-js';

const ChatHeader = ({ user }: { user: User | undefined }) => {
    const handleLoginWithGithub = () => {
        const client = createClient();
        client.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: location.origin + '/auth/callback',
            }
        })
    }

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
    }

    return (
        <div className="h-20">
            <div className="border-b p-5 flex justify-between items-center h-full">
                <div>
                    <h1 className="text-xl font-bold"> Daily Chat </h1>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                        <h1 className="text-sm text-gray-400">2 onlines</h1>
                    </div>
                </div>
                {user ?
                    <Button onClick={handleLogout}>LogOut</Button>:
                    <Button onClick={handleLoginWithGithub}>Login</Button> 
                }
            </div>
        </div>
    )
}

export default ChatHeader