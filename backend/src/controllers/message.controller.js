import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const filteredUsers = await User.find({
            _id: { $ne: req.user._id },
            isAI: { $ne: true },
        }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: conversationId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            text,
            image: imageUrl,
            readBy: [senderId],
            deliveredTo: [senderId],
        });

        conversation.lastMessage = {
            text: text || "📷 Image",
            senderId,
            createdAt: newMessage.createdAt,
        };
        await conversation.save();

        conversation.participants
            .filter((p) => p.toString() !== senderId.toString())
            .forEach((participantId) => {
                const socketId = getReceiverSocketId(participantId.toString());
                if (socketId) io.to(socketId).emit("newMessage", newMessage);
            });

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            { conversationId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId, deliveredTo: userId } }
        );

        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            conversation.participants
                .filter((p) => p.toString() !== userId.toString())
                .forEach((participantId) => {
                    const socketId = getReceiverSocketId(participantId.toString());
                    if (socketId) io.to(socketId).emit("messagesRead", { conversationId, userId: userId.toString() });
                });
        }

        res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        console.log("Error in markMessagesAsRead:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchMessages = async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user._id;
        if (!q || !q.trim()) return res.status(200).json([]);

        const myConversations = await Conversation.find({ participants: userId }).select("_id");
        const conversationIds = myConversations.map((c) => c._id);

        const messages = await Message.find({
            conversationId: { $in: conversationIds },
            text: { $regex: q, $options: "i" },
        })
            .sort({ createdAt: -1 })
            .limit(30);

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in searchMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};