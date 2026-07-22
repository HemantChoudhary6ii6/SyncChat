import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const chatWithAI = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const userId = req.user._id;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const aiUser = await User.findOne({ isAI: true });
        if (!aiUser) return res.status(500).json({ message: "AI assistant not configured" });

        const userMessage = await Message.create({
            conversationId,
            senderId: userId,
            text,
            readBy: [userId],
            deliveredTo: [userId],
        });

        const history = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(20);
        const apiMessages = history.map((m) => ({
            role: m.senderId.toString() === aiUser._id.toString() ? "assistant" : "user",
            content: m.text || "",
        }));

        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.AI_API_KEY}`,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                max_tokens: 1024,
                messages: apiMessages,
            }),
        });

        if (!aiResponse.ok) {
            console.log("API error:", await aiResponse.text());
            return res.status(502).json({ message: "AI assistant is unavailable right now" });
        }

        const data = await aiResponse.json();
        const aiText = data.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";

        const aiMessage = await Message.create({
            conversationId,
            senderId: aiUser._id,
            text: aiText,
            readBy: [aiUser._id],
            deliveredTo: [aiUser._id, userId],
        });

        conversation.lastMessage = { text: aiText, senderId: aiUser._id, createdAt: aiMessage.createdAt };
        await conversation.save();

        const socketId = getReceiverSocketId(userId.toString());
        if (socketId) io.to(socketId).emit("newMessage", aiMessage);

        res.status(201).json({ userMessage, aiMessage });
    } catch (error) {
        console.log("Error in chatWithAI:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};