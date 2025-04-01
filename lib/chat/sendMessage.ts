import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database.types";

export type MessageRow = Tables<"messages">;

export async function sendMessage(
  supabase: SupabaseClient<Database>,
  {
    text,
    userId,
    roomId,
  }: {
    text: string;
    userId: string;
    roomId: string;
  }
): Promise<MessageRow> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Message text is required");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      text: trimmed,
      send_by: userId,
      room_id: roomId,
      is_edit: false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

