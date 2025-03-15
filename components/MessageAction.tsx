'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { useMessages } from "@/lib/store/messages";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const DeleteAlert = () => {
    const optimisticDeleteMessage = useMessages((state) => state.optimisticDeleteMessage);
    const { actionMessage, setAction, actionType } = useMessages();
    const open = actionType === 'delete';

    const supabase = createClient();

    const handleDeleteMessage = async () => {
        if (!actionMessage) { return; }

        optimisticDeleteMessage(actionMessage.id);

        const { data, error } = await supabase.from('messages').delete().eq('id', actionMessage?.id);
        if (error) {
            toast.error(error.message);
            return;
        } else {
            toast.success("Message deleted successfully");
        }

        setAction(undefined, null); // close the dialog
    }

    return (
        <AlertDialog open={open} onOpenChange={() => {
            setAction(undefined, null);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the message.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setAction(undefined, null)}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleDeleteMessage}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export function EditAlert() {
    const [text, setText] = useState('');
    const { actionMessage, actionType, setAction, optimisticEditMessage } = useMessages();

    const open = actionType === 'edit';

    // sync text when message changes
    useEffect(() => {
        if (actionMessage) {
            setText(actionMessage.text);
        }
    }, [actionMessage]);

    const closeDialog = () => setAction(undefined, null);

    const handleEditMessage = async () => {
        if (!actionMessage || !text.trim()) return;

        const supabase = createClient();

        const updatedMessage = {
            ...actionMessage,
            text,
            is_edit: true,
        };

        // optimistic update
        optimisticEditMessage(updatedMessage);
        closeDialog();

        const { error } = await supabase
            .from('messages')
            .update({ text })
            .eq('id', actionMessage.id);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Message edited successfully");
    };

    return (
        <Dialog open={open} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit Message</DialogTitle>
                    <DialogDescription>
                        Update your message below.
                    </DialogDescription>
                </DialogHeader>

                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Edit your message..."
                />

                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>
                        Cancel
                    </Button>

                    <Button onClick={handleEditMessage} disabled={!text.trim()}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}