import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "-password")
            .sort({ updatedAt: -1 });

        const withUnread = await Promise.all(
            conversations.map(async (convo) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: convo._id,
                    senderId: { $ne: userId },
                    readBy: { $ne: userId },
                });
                return { ...convo.toObject(), unreadCount };
            })
        );

        res.status(200).json(withUnread);
    } catch (error) {
        console.log("Error in getConversations:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const startDirectConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        const myId = req.user._id;

        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [myId, userId], $size: 2 },
        }).populate("participants", "-password");

        if (!conversation) {
            conversation = await Conversation.create({ participants: [myId, userId], isGroup: false });
            conversation = await conversation.populate("participants", "-password");
        }

        res.status(200).json({ ...conversation.toObject(), unreadCount: 0 });
    } catch (error) {
        console.log("Error in startDirectConversation:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createGroupConversation = async (req, res) => {
    try {
        const { name, participantIds } = req.body;
        const myId = req.user._id;

        if (!name || !participantIds || participantIds.length < 2) {
            return res.status(400).json({ message: "Group needs a name and at least 2 other members" });
        }

        const participants = [...new Set([myId.toString(), ...participantIds])];

        const conversation = await Conversation.create({
            participants,
            isGroup: true,
            groupName: name,
            groupAdmin: myId,
        });

        const populated = await conversation.populate("participants", "-password");
        res.status(201).json({ ...populated.toObject(), unreadCount: 0 });
    } catch (error) {
        console.log("Error in createGroupConversation:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const startAIConversation = async (req, res) => {
    try {
        const myId = req.user._id;

        let aiUser = await User.findOne({ isAI: true });
        if (!aiUser) {
            aiUser = await User.create({
                fullName: "AI Assistant",
                email: `ai-assistant-${Date.now()}@syncchat.local`,
                password: "not-a-real-login-placeholder",
                isAI: true,
            });
        }

        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [myId, aiUser._id], $size: 2 },
        }).populate("participants", "-password");

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [myId, aiUser._id],
                isGroup: false,
                isAI: true,
            });
            conversation = await conversation.populate("participants", "-password");
        }

        res.status(200).json({ ...conversation.toObject(), unreadCount: 0 });
    } catch (error) {
        console.log("Error in startAIConversation:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};