'use client'

import { Imessage, useMessages } from "@/lib/store/messages"
import Message from "./Message";
import { DeleteAlert } from "./MessageAction";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, Loader2 } from "lucide-react";

type MessagesListProps = {
    onLoadPrevious: () => void;
    loadingPrevious: boolean;
    hasMorePrevious: boolean;
};

const MessagesList = ({ onLoadPrevious, loadingPrevious, hasMorePrevious }: MessagesListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [userScrolled, setUserScrolled] = useState(false);
    const [notifications, setNotifications] = useState(0);
    const [user, setUser] = useState<any>(null);

    const { messages, addMessage, optimisticDeleteMessage, optimisticEditMessage } =
        useMessages((state) => state);

    const supabase = createClient();

    const loadingPreviousRef = useRef<boolean>(false);
    const previousScrollHeightRef = useRef<number>(0);

    useEffect(() => {
        if (loadingPrevious && !loadingPreviousRef.current) {
            previousScrollHeightRef.current = scrollRef.current?.scrollHeight ?? 0;
        }

        if (!loadingPrevious && loadingPreviousRef.current) {
            const scrollContainer = scrollRef.current;
            if (scrollContainer) {
                const newScrollHeight = scrollContainer.scrollHeight;
                scrollContainer.scrollTop = newScrollHeight - previousScrollHeightRef.current;
            }
        }

        loadingPreviousRef.current = loadingPrevious;
    }, [loadingPrevious]);

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
                    addMessage(newMessage as Imessage);
                }
                setNotifications((prev) => prev + 1);
            }).on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                optimisticDeleteMessage(payload.old.id);
            }).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                optimisticEditMessage(payload.new as Imessage);
            }).subscribe();

        return () => {
            channel.unsubscribe();
        }
    }, [user]);

    // for scrolling to bottom on new message
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && !userScrolled && !loadingPrevious) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [messages, userScrolled, loadingPrevious]);

    const handleOnScroll = () => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            const isAtBottom = scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight - 20;
            const isNearTop = scrollContainer.scrollTop <= 80;

            if (isNearTop && hasMorePrevious && !loadingPrevious) {
                onLoadPrevious();
            }

            if (isAtBottom) {
                setNotifications(0);
            }

            if (userScrolled !== !isAtBottom) {
                setUserScrolled(!isAtBottom);
            }
        }
    }

    const scrollDown = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    return (
        <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
            {loadingPrevious && (
                <div className="absolute top-0 left-0 right-0 z-10 text-center text-sm py-2">
                    <Loader2 className="animate-spin mx-auto" />
                </div>
            )}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 flex flex-col" ref={scrollRef} onScroll={handleOnScroll}>
                <div className="space-y-7">
                    {messages.map((message) => {
                        return <Message key={message.id} message={message} />
                    })}
                </div>
            </div>
            {userScrolled && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
                    {notifications > 0 ? (
                        <div className="cursor-pointer bg-red-400 px-4 h-10 flex items-center justify-center rounded-full text-white shadow-md text-nowrap whitespace-nowrap" onClick={scrollDown}>
                            {notifications} new message{notifications > 1 ? 's' : ''}
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full justify-center items-center flex border cursor-pointer hover:scale-110 transition-all text-white shadow-md" onClick={scrollDown}>
                            <ArrowDown />
                        </div>
                    )}
                </div>
            )}
            <DeleteAlert />
        </div>
    )
}

export default MessagesList 