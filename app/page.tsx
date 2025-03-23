import { createServerSideClient } from "@/lib/supabase/server";

import InitUser from "@/lib/store/initUser";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import AppIntro from "@/components/AppIntro";

export default async function Home() {
  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();

  return (
    <>
      <div className="max-w-3xl mx-auto h-dvh min-h-0 md:h-screen md:py-10">
        <div className="h-full border rounded-md flex flex-col relative min-h-0   ">
          <ChatHeader user={data.user ? data.user : undefined} />
          {
            data.user ? (
              <>
                <ChatMessages />
                <ChatInput />
              </>
            ) : (
              <AppIntro />
            )
          }
        </div>
      </div>
      {data.user && <InitUser user={data.user} />}
    </>
  );
}
