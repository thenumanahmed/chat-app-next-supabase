'use client'

import { useMessages } from "@/lib/store/messages"
import Message from "./Message";
import { DeleteAlert, EditAlert } from "./MessageAction";

const MessagesList = () => {
    const messages = useMessages((state) => state.messages);

    return (
        <div className="flex-1 flex flex-col p-5 h-full overflow-y-auto">
            <div className="flex-1"></div>
            <div className="space-y-7">
                {
                    messages.map((message, index) => {
                        return <Message key={index} message={message} />
                    })
                }
            </div>
            <DeleteAlert />
            <EditAlert />
        </div>
    )
}

export default MessagesList 