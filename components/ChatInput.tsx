'use client'

import { createClient } from "@/lib/supabase/client"
import { Input } from "./ui/input"
import { toast } from "sonner";

const ChatInput = () => {
    const supabase = createClient();

    const handleSendMessage = async (text: string) => {
        const payload = {
            text,
        };
        const { error } = await supabase.from('messages').insert(payload);
        if (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return (
        <div className="p-5">
            <Input placeholder="send message" onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                }
            }} />
        </div>
    )
}

export default ChatInput