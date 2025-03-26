'use client'

import { createClient } from "@/lib/supabase/client"
import { Input } from "./ui/input"
import { toast } from "sonner";
import { useUser } from "@/lib/store/user";
import { Imessage, useMessages } from "@/lib/store/messages";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmationDialog";

const ChatInput = () => {
    const supabase = createClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const user = useUser((state) => state.user);
    const { addMessage, actionMessage, actionType, setAction, optimisticEditMessage, optimisticDeleteMessage } = useMessages();

    const isEditing = actionType === 'edit';

    useEffect(() => {
        if (isEditing && actionMessage) {
            const text = actionMessage.text;
            setInputValue(text);

            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.focus();

                    const length = text.length;
                    inputRef.current.setSelectionRange(length, length);
                }
            });
        }
    }, [isEditing, actionMessage]);

    const handleEditMessage = async (text: string) => {
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
    const handleDeleteMessage = async () => {
        if (!actionMessage) return;

        setShowDeleteConfirmation(false);
        setAction(undefined, null);
        setInputValue('');

        optimisticDeleteMessage(actionMessage.id);

        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', actionMessage.id);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Message deleted successfully");
    };

    return (
        <div className="m-5 mt-2 shrink-0 flex flex-col">
            {isEditing && <div className="w-full border border-sky-800 bg-sky-950 h-8 px-4 pr-2 flex items-center justify-between text-sm rounded-md mb-2">
                <div className="text-gray-400 truncate">
                    Editing: {actionMessage?.text}
                </div>
                <X onClick={() => {
                    setShowDeleteConfirmation(false);
                    setAction(undefined, null);
                    setInputValue('');
                }} />
            </div>}
            <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e: any) => setInputValue(e.target.value)}
                placeholder="send message" onKeyDown={(e: any) => {
                    if (e.key === "Enter") {
                        const value = e.currentTarget.value as string;

                        if (isEditing && !value.trim()) {
                            e.preventDefault();
                            setShowDeleteConfirmation(true);
                            return;
                        }

                        if (value.trim() !== "") {
                            if (isEditing) {
                                handleEditMessage(value);
                            } else {
                                handleSendMessage(value);
                            }
                            e.currentTarget.value = '';
                            setInputValue('');
                        }
                    } else if (isEditing && (e.key === "Escape" || e.key === "Esc")) {
                        setAction(undefined, null);
                        setInputValue('');
                    }
                }}
            />
            
            {showDeleteConfirmation && (
                <ConfirmDialog
                    open={showDeleteConfirmation}
                    onCancel={() => {
                        setShowDeleteConfirmation(false);
                        requestAnimationFrame(() => {
                            inputRef.current?.focus();
                        });
                    }}
                    onConfirm={handleDeleteMessage}
                    title="Are you sure you want to delete this message?"
                    description={actionMessage?.text || ""}
                    confirmText="Yes, delete it"
                />
            )}
        </div>
    )
}

export default ChatInput
