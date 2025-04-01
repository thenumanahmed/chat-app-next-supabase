import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database.types";
import type { Imessage } from "@/lib/store/messages";

export type UserProfile = Tables<"users">;

export async function fetchUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function fetchMessagesPage(
  supabase: SupabaseClient<Database>,
  roomId: string,
  page: number,
  pageSize: number
): Promise<Imessage[]> {
  const start = (page - 1) * pageSize;
  const end = page * pageSize - 1;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) throw error;
  return (data ?? []) as unknown as Imessage[];
}

