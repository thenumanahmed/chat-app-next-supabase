import Image from "next/image";
import { useUser } from "@/lib/store/user";
import MessageMenu from "./MessageMenu";

const Message = ({ message }: { message: any }) => {
    const user = useUser((state) => state.user);
    const time = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(message.created_at));

    return (
        <div className="flex gap-2" >
            {/* User Avatar */}
            {/* <div className="h-10 w-10 bg-green-500 rounded-full"></div> */}
            <div>
                <Image
                    src={message.users?.avatar_url}
                    alt={message.users?.display_name || 'Unknown User'}
                    width={40} height={40}
                    className="rounded-full ring-2"
                />
            </div>

            {/* Message Content */}
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                        <h1 className="font-bold">{message.users?.display_name || 'Unknown User'}</h1>
                        {message.is_edit && <h1 className="text-sm text-gray-400">(edited)</h1>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">{time}</span>
                        {user?.id === message.users?.id && <MessageMenu message={message} />}
                    </div>
                </div>
                <p className="text-gray-300">{message.text}</p>
            </div>
        </div>
    )
}

export default Message