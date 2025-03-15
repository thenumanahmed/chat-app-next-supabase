'use client'

import { createClient } from "@/lib/supabase/client"
import { Input } from "./ui/input"
import { toast } from "sonner";
import { v4 as uuidv4} from "uuid";
import { useUser } from "@/lib/store/user";
import { Imessage, useMessages } from "@/lib/store/messages";

const ChatInput = () => {
    const supabase = createClient();
    const user = useUser((state) => state.user);
    const addMessage = useMessages((state) => state.addMessage);

    const handleSendMessage = async (text: string) => {
        const newMessage = {
            id: crypto.getRandomValues(new Uint32Array(1))[0],// big int
            text,
            send_by: user?.id,
            is_edit: false,
            created_at: new Date().toISOString(),
            users: {
                id: user?.id,
                display_name: user?.user_metadata.user_name,
                avatar_url: user?.user_metadata.avatar_url,
                created_at: user?.created_at
            }
        }
        addMessage(newMessage as Imessage);
        const { error } = await supabase.from('messages').insert({text});
        if (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="p-5">
            <Input placeholder="send message" onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                }
            }} />
        </div>
    )
}

export default ChatInput