import ChatHeader from "@/components/ChatHeader";
import { createServerSideClient } from "@/lib/supabase/server";
import InitUser from "@/lib/store/initUser";
export default async function Home() {
  const supabase = createServerSideClient();
  const { data } = await (await supabase).auth.getSession();

  return (
    <>
      <div className="max-w-3xl mx-auto md:py-10 h-screen">
        <div className="h-full border rounded-md">
          <ChatHeader user={data.session?.user} />
        </div>
      </div>
      <InitUser user={data.session?.user} />
    </>
  );
}
