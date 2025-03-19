'use client'

import { createClient } from "@/lib/supabase/client"
import { Input } from "./ui/input"
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/lib/store/user";
import { Imessage, useMessages } from "@/lib/store/messages";
import { X } from "lucide-react";

const ChatInput = () => {
    const supabase = createClient();
    const user = useUser((state) => state.user);
    const { addMessage, actionMessage, actionType, setAction, optimisticEditMessage } = useMessages();

    const isEditing = actionType === 'edit';

    const handleEditMessage = async (text:string) => {
        if (!actionMessage || !text.trim()) return;

        const updatedMessage = {
            ...actionMessage,
            text,
            is_edit: true,
        };

        // optimistic update
        optimisticEditMessage(updatedMessage);
        setAction(undefined, null);

        const { error } = await supabase
            .from('messages')
            .update({ text, is_edit: true })
            .eq('id', actionMessage.id);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Message edited successfully");
    };

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
        const { error } = await supabase.from('messages').insert({ text });
        if (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="m-5 mt-2 flex flex-col">
            {isEditing && <div className="w-full bg-amber-950 h-8 px-4 pr-2 flex items-center justify-between text-sm rounded-md mb-2">
                <div className="text-gray-600 truncate">
                    Editing: {actionMessage?.text}
                </div>
                <X onClick={() => setAction(undefined, null)}/>
            </div>}
            <Input placeholder="send message" onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                    if(isEditing){
                        handleEditMessage(e.currentTarget.value);
                    }else{
                        handleSendMessage(e.currentTarget.value);
                    }
                    e.currentTarget.value = '';
                }
            }} />
        </div>
    )
}

export default ChatInput