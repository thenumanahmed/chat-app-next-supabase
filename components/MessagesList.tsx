'use client'

import { Imessage, useMessages } from "@/lib/store/messages"
import Message from "./Message";
import { DeleteAlert, EditAlert } from "./MessageAction";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown } from "lucide-react";

const MessagesList = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [userScrolled, setUserScrolled] = useState(false);
    const [notifications, setNotifications] = useState(0);
    const [user, setUser] = useState<any>(null);

    const { messages, addMessage, optimisticDeleteMessage, optimisticEditMessage } =
        useMessages((state) => state);

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error(error);
                return;
            }
            setUser(data.user);
        };

        getUser();
    }, []);


    useEffect(() => {
        if (!user) return; // only subscribe to channel when user is loaded

        const channel = supabase
            .channel('general_chat_channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                // console.log('Message received', payload);
                if (payload.new.send_by === user?.id) {
                    return;
                }
                const { error, data: userData } = await supabase.from('users')
                    .select('*')
                    .eq('id', payload.new.send_by)
                    .single();

                if (error) {
                    toast.error(error.message);
                } else {
                    const newMessage = {
                        ...payload.new,
                        users: userData,
                    };

                    // console.log('User data!', newMessage);
                    addMessage(newMessage as Imessage);
                }
                setNotifications((prev) => prev + 1);
            }).on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                // delete message from state
                optimisticDeleteMessage(payload.old.id);
                // console.log('Message deleted', payload);
            }).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                // update message in state
                optimisticEditMessage(payload.new as Imessage);
                // console.log('Message updated', payload);
            }).subscribe();

        return () => {
            channel.unsubscribe();
        }
    }, [user]);

    // for scrolling to bottom on new message
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && !userScrolled) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [messages]);

    const handleOnScroll = () => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            const isScroll = scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight - 20;
            if (!isScroll) {
                setNotifications(0);
            }
            if (isScroll !== userScrolled) {
                setUserScrolled(isScroll);
            }
        }
    }

    const scrollDown = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    return (
        <div className="flex-1 flex flex-col p-5 h-full overflow-y-auto" ref={scrollRef} onScroll={handleOnScroll}>
            <div className="flex-1"></div>
            <div className="space-y-7">
                {
                    messages.map((message, index) => {
                        return <Message key={index} message={message} />
                    })
                }
            </div>
            {userScrolled && (
                <div className="absolute bottom-20 w-full">
                    {notifications > 0 ? (
                        <div className="mx-auto cursor-pointer bg-red-400 max-w-36 flex
                        items-center justify-center rounded-full" onClick={scrollDown}>
                            {notifications} new message{notifications > 1 ? 's' : ''}
                        </div>
                    ) :
                        <div className="w-10 h-10 bg-blue-500 rounded-full 
                        justify-center items-center flex mx-auto border 
                        cursor-pointer hover:scale-110 transition-all"
                            onClick={scrollDown}
                        >
                            <ArrowDown />
                        </div>}
                </div>
            )}
            <DeleteAlert />
        </div>
    )
}

export default MessagesList 