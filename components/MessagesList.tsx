'use client'

import { Imessage, useMessages } from "@/lib/store/messages"
import Message from "./Message";
import { DeleteAlert } from "./MessageAction";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";

type MessagesListProps = {
    onLoadPrevious: () => void;
    loadingPrevious: boolean;
    hasMorePrevious: boolean;
};

const dateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const dateLabel = (date: Date) => {
    const today = new Date();
    const todayKey = dateKey(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = dateKey(yesterday);

    const key = dateKey(date);
    if (key === todayKey) return 'Today';
    if (key === yesterdayKey) return 'Yesterday';

    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

type RenderItem =
    | { type: 'header'; key: string; label: string }
    | { type: 'message'; message: Imessage };

const buildRenderItems = (messages: Imessage[]): RenderItem[] => {
    const items: RenderItem[] = [];
    let lastDateKey: string | null = null;

    for (const message of messages) {
        const createdAt = new Date(message.created_at);
        const key = dateKey(createdAt); // date key in format YYYY-MM-DD

        if (key !== lastDateKey) {
            items.push({ type: 'header', key, label: dateLabel(createdAt) });
            lastDateKey = key;
        }

        items.push({ type: 'message', message });
    }

    return items;
};

const MessagesList = ({ onLoadPrevious, loadingPrevious, hasMorePrevious }: MessagesListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [userScrolled, setUserScrolled] = useState(false);
    const [notifications, setNotifications] = useState(0);
    const lastMessageIdRef = useRef<number | null>(null);

    const messages = useMessages((state) => state.messages);

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
        const latestId = messages.length ? messages[messages.length - 1]?.id : null;
        const isNewMessage = latestId && latestId !== lastMessageIdRef.current;
        lastMessageIdRef.current = latestId;

        if (isNewMessage && userScrolled && !loadingPrevious) {
            setNotifications((prev) => prev + 1);
        }
    }, [messages, userScrolled, loadingPrevious]);

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

    const items = useMemo(() => buildRenderItems(messages), [messages]);

    return (
        <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
            {loadingPrevious && (
                <div className="absolute top-0 left-0 right-0 z-10 text-center text-sm py-2">
                    <Loader2 className="animate-spin mx-auto" />
                </div>
            )}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 flex flex-col" ref={scrollRef} onScroll={handleOnScroll}>
                <div className="space-y-7">
                    {items.map((item) => {
                        if (item.type === 'header') {
                            return (
                                <div key={`date-${item.key}`} className="flex justify-center">
                                    <div className="text-xs text-gray-300 bg-gray-900/60 border border-gray-800 px-3 py-1 rounded-full">
                                        {item.label}
                                    </div>
                                </div>
                            );
                        }
                        return <Message key={item.message.id} message={item.message} />;
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

export default MessagesList;
