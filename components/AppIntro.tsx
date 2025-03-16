const AppIntro = () => {
  return (
    <div className="flex justify-center items-center flex-col h-full text-center">
      <h1 className="text-3xl font-bold bg-linear-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
        Welcome to the Chat Room
      </h1>
      <p className="mt-2 text-gray-600">
        Please login first to join the conversation.
      </p>
    </div>
  );
};

export default AppIntro;