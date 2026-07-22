import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatDateSeparator } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedConversation,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const bottomAnchorRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    getMessages(selectedConversation._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedConversation._id]);

  useEffect(() => {
    if (bottomAnchorRef.current)
      bottomAnchorRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!lightboxImage) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxImage]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  let lastDateLabel = null;

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-base-200/40">
        {messages.map((message) => {
          const dateLabel = formatDateSeparator(message.createdAt);
          const showDateSeparator = dateLabel !== lastDateLabel;
          lastDateLabel = dateLabel;

          const isMine = message.senderId === authUser._id;
          const sender = selectedConversation.participants.find(
            (p) => p._id === message.senderId,
          );
          const isRead = message.readBy?.some(
            (id) =>
              id !== authUser._id &&
              selectedConversation.participants.some((p) => p._id === id),
          );

          return (
            <div key={message._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="badge badge-neutral badge-sm opacity-70">
                    {dateLabel}
                  </span>
                </div>
              )}

              <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border border-base-300">
                    <img
                      src={
                        (isMine ? authUser.profilePic : sender?.profilePic) ||
                        "/avatar.png"
                      }
                      alt=""
                    />
                  </div>
                </div>

                <div className="chat-header mb-1 text-xs opacity-60 flex items-center gap-2">
                  {selectedConversation.isGroup && !isMine && (
                    <span>{sender?.fullName}</span>
                  )}
                  <time className="opacity-50">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>

                <div
                  className={`chat-bubble flex flex-col shadow-none ${
                    isMine
                      ? "chat-bubble-primary"
                      : "bg-base-100 border border-base-300 text-base-content"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      onClick={() => setLightboxImage(message.image)}
                      className="sm:max-w-[200px] rounded-md mb-2 hover:opacity-90 transition-opacity"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>

                {isMine && (
                  <div className="chat-footer opacity-60 flex items-center gap-1 text-xs mt-0.5">
                    {isRead ? (
                      <CheckCheck size={14} className="text-info" />
                    ) : (
                      <Check size={14} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomAnchorRef} />
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-neutral/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 btn btn-circle btn-sm bg-base-100/90 border-none"
            onClick={() => setLightboxImage(null)}
          >
            <X size={18} />
          </button>
          <img
            src={lightboxImage}
            alt="Full size attachment"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
