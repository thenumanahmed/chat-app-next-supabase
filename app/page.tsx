import { createSupabaseServerObject } from "@/lib/supabase/server";

import InitUser from "@/lib/store/initUser";
import ChatHeader from "@/components/ChatHeader";
import AppIntro from "@/components/AppIntro";
import HomeLandingActions from "@/components/HomeLandingActions";

export default async function Home() {
  const supabase = await createSupabaseServerObject();
  const { data } = await supabase.auth.getUser();

  return (
    <>
      <div className="max-w-3xl mx-auto h-dvh min-h-0 md:h-screen md:py-10">
        <div className="h-full border rounded-md flex flex-col relative min-h-0   ">
          <ChatHeader user={data.user ? data.user : undefined} />

          {data.user ? (
            <div className="flex-1 min-h-0 flex items-center justify-center flex-col text-center px-6">
              <div className="w-full max-w-xl">
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
                  Daily Chat
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Jump into the global room, or create a shareable room link you can send to anyone
                  with an account.
                </p>
                <HomeLandingActions className="mt-6" />
              </div>
            </div>
          ) : (
            <AppIntro />
          )}
        </div>
      </div>
      {data.user && <InitUser user={data.user} />}
    </>
  );
}
