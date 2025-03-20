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
      <div className="max-w-3xl mx-auto md:py-10 h-screen">
        <div className="h-full border rounded-md flex flex-col relative">
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
