import { X, Users, Bot } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const getConversationName = (conversation, authUserId) => {
  if (conversation.isAI) return "AI Assistant";
  if (conversation.isGroup) return conversation.groupName;
  const other = conversation.participants.find((p) => p._id !== authUserId);
  return other?.fullName || "Unknown";
};

const getConversationAvatar = (conversation, authUserId) => {
  const other = conversation.participants.find((p) => p._id !== authUserId);
  return other?.profilePic || "/avatar.png";
};

const ChatHeader = () => {
  const { selectedConversation, setSelectedConversation, typingUsers } =
    useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  const other = !selectedConversation.isGroup
    ? selectedConversation.participants.find((p) => p._id !== authUser._id)
    : null;

  const isTyping = (typingUsers[selectedConversation._id]?.size || 0) > 0;

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative flex items-center justify-center bg-primary/10 border border-base-300">
              {selectedConversation.isAI ? (
                <Bot className="size-6 text-primary" />
              ) : selectedConversation.isGroup ? (
                <Users className="size-6 text-primary" />
              ) : (
                <img
                  src={getConversationAvatar(
                    selectedConversation,
                    authUser._id,
                  )}
                  alt=""
                  className="rounded-full"
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium">
              {getConversationName(selectedConversation, authUser._id)}
            </h3>
            <p className="text-sm text-base-content/50">
              {isTyping
                ? "typing..."
                : selectedConversation.isAI
                  ? "Always here to help"
                  : selectedConversation.isGroup
                    ? `${selectedConversation.participants.length} members`
                    : onlineUsers.includes(other?._id)
                      ? "Online"
                      : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedConversation(null)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
