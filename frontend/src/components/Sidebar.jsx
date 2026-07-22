import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Bot, Plus, X } from "lucide-react";
import { formatLastMessagePreview, formatMessageTime } from "../lib/utils";

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

const Sidebar = () => {
  const {
    conversations,
    getConversations,
    selectedConversation,
    setSelectedConversation,
    isConversationsLoading,
    startConversation,
    startAIChat,
    createGroup,
    searchMessages,
    searchResults,
    searchQuery,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  const hasAIConversation = conversations.some((c) => c.isAI);
  const aiPlaceholder = hasAIConversation
    ? null
    : { _id: "__ai_placeholder__", isAI: true, isPlaceholder: true };

  const listItems = aiPlaceholder
    ? [aiPlaceholder, ...conversations]
    : conversations;

  const openNewChat = async (group = false) => {
    try {
      const res = await axiosInstance.get("/messages/users");
      setAllUsers(res.data);
      setShowNewChat(true);
      setShowNewGroup(group);
    } catch {
      /* ignore */
    }
  };

  const toggleGroupMember = (userId) => {
    setGroupMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupMembers.length < 2) return;
    const convo = await createGroup({
      name: groupName.trim(),
      participantIds: groupMembers,
    });
    if (convo) {
      setSelectedConversation(convo);
      setShowNewChat(false);
      setShowNewGroup(false);
      setGroupName("");
      setGroupMembers([]);
    }
  };

  if (isConversationsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
      <div className="border-b border-base-300 w-full p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-primary" />
            <span className="font-medium hidden lg:block">Chats</span>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => openNewChat(false)}
              title="New chat"
            >
              <Plus size={16} />
            </button>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => openNewChat(true)}
              title="New group"
            >
              <Users size={16} />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 relative">
          <Search size={16} className="absolute left-3 text-base-content/40" />
          <input
            type="text"
            placeholder="Search messages..."
            className="input input-bordered input-sm w-full pl-9 bg-base-200 border-base-300"
            value={searchQuery}
            onChange={(e) => searchMessages(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 flex-1">
        {searchQuery.trim() ? (
          searchResults.length === 0 ? (
            <div className="text-center text-base-content/50 py-4 text-sm hidden lg:block">
              No messages found
            </div>
          ) : (
            searchResults.map((msg) => {
              const convo = conversations.find(
                (c) => c._id === msg.conversationId,
              );
              return (
                <button
                  key={msg._id}
                  onClick={() => convo && setSelectedConversation(convo)}
                  className="w-full p-3 flex flex-col items-start hover:bg-base-200 text-left transition-colors"
                >
                  <span className="text-xs font-medium hidden lg:block">
                    {convo
                      ? getConversationName(convo, authUser._id)
                      : "Conversation"}
                  </span>
                  <span className="text-sm truncate w-full hidden lg:block text-base-content/80">
                    {msg.text}
                  </span>
                  <span className="text-[10px] text-base-content/40 hidden lg:block">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </button>
              );
            })
          )
        ) : (
          <>
            {listItems.map((item) => {
              const isPlaceholder = item.isPlaceholder;
              const other =
                !isPlaceholder && !item.isGroup && !item.isAI
                  ? item.participants.find((p) => p._id !== authUser._id)
                  : null;
              const isOnline = other && onlineUsers.includes(other._id);

              const name = isPlaceholder
                ? "AI Assistant"
                : getConversationName(item, authUser._id);
              const preview = isPlaceholder
                ? "Ask me anything"
                : formatLastMessagePreview(item);

              return (
                <button
                  key={item._id}
                  onClick={() =>
                    isPlaceholder
                      ? startAIChat()
                      : setSelectedConversation(item)
                  }
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors ${
                    !isPlaceholder && selectedConversation?._id === item._id
                      ? "bg-base-200"
                      : ""
                  }`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    {item.isAI ? (
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="size-6 text-primary" />
                      </div>
                    ) : item.isGroup ? (
                      <div className="size-12 rounded-full bg-base-300 flex items-center justify-center">
                        <Users className="size-6 text-base-content/60" />
                      </div>
                    ) : (
                      <img
                        src={getConversationAvatar(item, authUser._id)}
                        alt=""
                        className="size-12 object-cover rounded-full border border-base-300"
                      />
                    )}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100" />
                    )}
                  </div>

                  <div className="hidden lg:flex flex-1 min-w-0 items-center justify-between">
                    <div className="min-w-0 text-left">
                      <div className="font-medium truncate">{name}</div>
                      <div className="text-sm text-base-content/50 truncate">
                        {preview}
                      </div>
                    </div>
                    {!isPlaceholder && item.unreadCount > 0 && (
                      <span className="badge badge-primary badge-sm ml-2">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {listItems.length === 0 && (
              <div className="text-center text-base-content/50 py-4 text-sm hidden lg:block">
                No chats yet — start one!
              </div>
            )}
          </>
        )}
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-neutral/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto border border-base-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">
                {showNewGroup ? "New group" : "New chat"}
              </h3>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setShowNewGroup(false);
                  setGroupMembers([]);
                }}
              >
                <X size={18} />
              </button>
            </div>

            {showNewGroup && (
              <input
                type="text"
                placeholder="Group name"
                className="input input-bordered input-sm w-full mb-3 bg-base-200 border-base-300"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            )}

            <div className="space-y-1">
              {allUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={async () => {
                    if (showNewGroup) {
                      toggleGroupMember(user._id);
                    } else {
                      const convo = await startConversation(user._id);
                      if (convo) {
                        setSelectedConversation(convo);
                        setShowNewChat(false);
                      }
                    }
                  }}
                  className={`w-full p-2 flex items-center gap-2 rounded hover:bg-base-200 transition-colors ${
                    groupMembers.includes(user._id) ? "bg-base-200" : ""
                  }`}
                >
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt=""
                    className="size-8 rounded-full border border-base-300"
                  />
                  <span className="text-sm">{user.fullName}</span>
                </button>
              ))}
            </div>

            {showNewGroup && (
              <button
                className="btn btn-primary btn-sm w-full mt-3"
                disabled={!groupName.trim() || groupMembers.length < 2}
                onClick={handleCreateGroup}
              >
                Create group ({groupMembers.length} selected)
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
