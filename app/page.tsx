import ChatHeader from "@/components/ChatHeader";
import { createServerSideClient } from "@/lib/supabase/server";
import InitUser from "@/lib/store/initUser";
import ChatInput from "@/components/ChatInput";
export default async function Home() {
  const supabase = createServerSideClient();
  const { data } = await (await supabase).auth.getSession();

  return (
    <>
      <div className="max-w-3xl mx-auto md:py-10 h-screen">
        <div className="h-full border rounded-md flex flex-col">
          <ChatHeader user={data.session?.user} />
          <div className="flex-1 flex flex-col p-5 h-full overflow-y-auto">
            <div className="flex-1"></div>
            <div className="space-y-7">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((val) => {
                return <div className="flex gap-2" key={val}>
                  <div className="h-10 w-10 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h1 className="font-bold">NAAME</h1>
                      <h1 className="text-sm text-gray-400">{new Date().toDateString()}</h1>
                    </div>
                    <p className="text-gray-300">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Enim, nemo.
                      Officia earum dolorum quo. Rerum asperiores cumque repellat maxime nam.</p>
                  </div>
                </div>
              })}
            </div>
          </div>
          <ChatInput />
        </div>
      </div>
      <InitUser user={data.session?.user} />
    </>
  );
}
