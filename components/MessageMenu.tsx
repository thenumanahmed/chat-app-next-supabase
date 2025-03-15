import { Imessage, useMessages } from '@/lib/store/messages';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type props = {
    message: Imessage;
}

const MessageMenu = (
    { message }: props
) => {
    const setAction = useMessages((state) => state.setAction);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={()=> setAction(message, "edit")}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAction(message, "delete")}>Delete</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default MessageMenu