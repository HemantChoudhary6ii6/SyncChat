import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedConversation } = useChatStore();

  return (
    <div className="h-screen pt-16 bg-base-100">
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        {!selectedConversation ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};
export default HomePage;
