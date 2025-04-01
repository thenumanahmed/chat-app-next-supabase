import { createSupabaseServerObject } from "@/lib/supabase/server";
import InitUser from "@/lib/store/initUser";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import AppIntro from "@/components/AppIntro";
import CreateRoomButton from "@/components/CreateRoomButton";
import { GENERAL_ROOM_ID } from "@/lib/chat/constants";

export default async function GeneralChatPage() {
  const supabase = await createSupabaseServerObject();
  const { data } = await supabase.auth.getUser();

  return (
    <>
      <div className="max-w-3xl mx-auto h-dvh min-h-0 md:h-screen md:py-10">
        <div className="h-full border rounded-md flex flex-col relative min-h-0">
          <ChatHeader user={data.user ? data.user : undefined} roomId={GENERAL_ROOM_ID} />
          {data.user ? (
            <>
              <div className="shrink-0 px-5 py-3 border-b flex items-center justify-end">
                <CreateRoomButton />
              </div>
              <ChatMessages roomId={GENERAL_ROOM_ID} />
              <ChatInput roomId={GENERAL_ROOM_ID} />
            </>
          ) : (
            <AppIntro />
          )}
        </div>
      </div>
      {data.user && <InitUser user={data.user} />}
    </>
  );
}

