'use client'

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createRoom } from "@/lib/chat/rooms";
import { Button } from "@/components/ui/button";

const CreateRoomButton = () => {
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const supabase = createClient();
      const room = await createRoom(supabase);
      router.push(`/chat/${room.id}`);
      toast.success("Room created");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create room";
      toast.error(message);
    }
  };

  return (
    <Button variant="outline" onClick={handleCreate}>
      Create New Chat Room
    </Button>
  )
};

export default CreateRoomButton;
