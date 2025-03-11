export default function Home() {
  return (
    <div className="max-w-3xl mx-auto md:py-10 h-screen">
      <div className="h-full border rounded-md">
        {/* chat header */}
        <div className="h-20">
          <div className="border-b p-5">
            <div>
              <h1> Daily Chat </h1>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                <h1 className="text-sm text-gray-400">2 onlines</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
