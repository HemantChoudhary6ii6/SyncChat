import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    conversations: [],
    messages: [],
    selectedConversation: null,
    isConversationsLoading: false,
    isMessagesLoading: false,
    typingUsers: {},
    searchResults: [],
    searchQuery: "",

    getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
            const res = await axiosInstance.get("/conversations");
            set({ conversations: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load chats");
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    startConversation: async (userId) => {
        try {
            const res = await axiosInstance.post("/conversations/dm", { userId });
            set((state) => {
                const exists = state.conversations.find((c) => c._id === res.data._id);
                return {
                    conversations: exists ? state.conversations : [res.data, ...state.conversations],
                };
            });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to start chat");
        }
    },

    createGroup: async ({ name, participantIds }) => {
        try {
            const res = await axiosInstance.post("/conversations/group", { name, participantIds });
            set((state) => ({ conversations: [res.data, ...state.conversations] }));
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    },

    startAIChat: async () => {
        try {
            const res = await axiosInstance.post("/conversations/ai");
            set((state) => {
                const exists = state.conversations.find((c) => c._id === res.data._id);
                return {
                    conversations: exists ? state.conversations : [res.data, ...state.conversations],
                    selectedConversation: res.data,
                };
            });
            return res.data;
        } catch (error) {
            toast.error("Failed to start AI chat");
        }
    },

    setSelectedConversation: (conversation) => set({ selectedConversation: conversation, messages: [] }),

    getMessages: async (conversationId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${conversationId}`);
            set({ messages: res.data });
            get().markAsRead(conversationId);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedConversation, messages } = get();
        try {
            if (selectedConversation.isAI) {
                const res = await axiosInstance.post(`/ai/chat`, {
                    conversationId: selectedConversation._id,
                    text: messageData.text,
                });
                set({ messages: [...get().messages, res.data.userMessage, res.data.aiMessage] });
                get().refreshConversationPreview(selectedConversation._id, res.data.aiMessage);
            } else {
                const res = await axiosInstance.post(`/messages/send/${selectedConversation._id}`, messageData);
                set({ messages: [...messages, res.data] });
                get().refreshConversationPreview(selectedConversation._id, res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    refreshConversationPreview: (conversationId, message) => {
        set((state) => ({
            conversations: state.conversations
                .map((c) =>
                    c._id === conversationId
                        ? { ...c, lastMessage: { text: message.text, senderId: message.senderId, createdAt: message.createdAt } }
                        : c
                )
                .sort(
                    (a, b) =>
                        new Date(b.lastMessage?.createdAt || b.updatedAt) - new Date(a.lastMessage?.createdAt || a.updatedAt)
                ),
        }));
    },

    markAsRead: async (conversationId) => {
        try {
            await axiosInstance.put(`/messages/read/${conversationId}`);
            set((state) => ({
                conversations: state.conversations.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c)),
            }));
        } catch {
            /* non-critical */
        }
    },

    searchMessages: async (query) => {
        set({ searchQuery: query });
        if (!query.trim()) return set({ searchResults: [] });
        try {
            const res = await axiosInstance.get(`/messages/search`, { params: { q: query } });
            set({ searchResults: res.data });
        } catch {
            /* non-critical */
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const { selectedConversation } = get();
            const isOpen = selectedConversation && newMessage.conversationId === selectedConversation._id;

            if (isOpen) {
                set((state) => ({ messages: [...state.messages, newMessage] }));
                get().markAsRead(selectedConversation._id);
            }

            get().refreshConversationPreview(newMessage.conversationId, newMessage);

            if (!isOpen) {
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c._id === newMessage.conversationId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
                    ),
                }));
            }
        });

        socket.on("messagesRead", ({ conversationId, userId }) => {
            set((state) => ({
                messages: state.messages.map((m) =>
                    m.conversationId === conversationId && !m.readBy.includes(userId)
                        ? { ...m, readBy: [...m.readBy, userId] }
                        : m
                ),
            }));
        });

        socket.on("typing", ({ conversationId, userId }) => {
            set((state) => {
                const current = new Set(state.typingUsers[conversationId] || []);
                current.add(userId);
                return { typingUsers: { ...state.typingUsers, [conversationId]: current } };
            });
        });

        socket.on("stopTyping", ({ conversationId, userId }) => {
            set((state) => {
                const current = new Set(state.typingUsers[conversationId] || []);
                current.delete(userId);
                return { typingUsers: { ...state.typingUsers, [conversationId]: current } };
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("typing");
        socket.off("stopTyping");
    },

    emitTyping: (conversationId) => {
        const socket = useAuthStore.getState().socket;
        const { selectedConversation } = get();
        if (!socket || !selectedConversation) return;
        socket.emit("typing", {
            conversationId,
            participantIds: selectedConversation.participants.map((p) => p._id),
        });
    },

    emitStopTyping: (conversationId) => {
        const socket = useAuthStore.getState().socket;
        const { selectedConversation } = get();
        if (!socket || !selectedConversation) return;
        socket.emit("stopTyping", {
            conversationId,
            participantIds: selectedConversation.participants.map((p) => p._id),
        });
    },
}));