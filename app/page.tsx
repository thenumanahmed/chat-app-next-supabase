import { createServerSideClient } from "@/lib/supabase/server";

import InitUser from "@/lib/store/initUser";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import AppIntro from "@/components/AppIntro";

export default async function Home() {
  const supabase = createServerSideClient();
  const { data } = await (await supabase).auth.getSession();

  return (
    <>
      <div className="max-w-3xl mx-auto md:py-10 h-screen">
        <div className="h-full border rounded-md flex flex-col relative">
          <ChatHeader user={data.session?.user} />
          {
            data.session?.user ? (
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
      <InitUser user={data.session?.user} />
    </>
  );
}
