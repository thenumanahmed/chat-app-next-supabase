import { createSupabaseServerObject } from "@/lib/supabase/server";
import InitUser from "@/lib/store/initUser";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import AppIntro from "@/components/AppIntro";
import { isValidUuid } from "@/lib/chat/uuid";
import { GENERAL_ROOM_ID } from "@/lib/chat/constants";
import { redirect } from "next/navigation";

export default async function DynamicChatPage({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = await params;
  if (roomId === GENERAL_ROOM_ID) {
    redirect("/general_chat");
  }

  const supabase = await createSupabaseServerObject();
  const { data } = await supabase.auth.getUser();

  const validRoomId = isValidUuid(roomId);

  return (
    <>
      <div className="max-w-3xl mx-auto h-dvh min-h-0 md:h-screen md:py-10">
        <div className="h-full border rounded-md flex flex-col relative min-h-0">
          <ChatHeader user={data.user ? data.user : undefined} roomId={roomId} />
          {data.user ? (
            validRoomId ? (
              <>
                <ChatMessages roomId={roomId} />
                <ChatInput roomId={roomId} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground px-6 text-center">
                Invalid room id. Check the URL and try again.
              </div>
            )
          ) : (
            <AppIntro />
          )}
        </div>
      </div>
      {data.user && <InitUser user={data.user} />}
    </>
  );
}
