import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { Tables } from "@/lib/database.types";

export type RoomRow = Tables<"rooms">;

export async function createRoom(
  supabase: SupabaseClient<Database>
): Promise<RoomRow> {
  const { data, error } = await supabase
    .from("rooms")
    .insert({})
    .select("id, created_at")
    .single();

  if (error) throw error;
  return data;
}
