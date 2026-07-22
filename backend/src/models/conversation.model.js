import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
        isGroup: { type: Boolean, default: false },
        isAI: { type: Boolean, default: false },
        groupName: { type: String, default: "" },
        groupImage: { type: String, default: "" },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        lastMessage: {
            text: String,
            senderId: mongoose.Schema.Types.ObjectId,
            createdAt: Date,
        },
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;