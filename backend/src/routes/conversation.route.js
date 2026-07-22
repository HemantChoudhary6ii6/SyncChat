import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getConversations,
    startDirectConversation,
    createGroupConversation,
    startAIConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", protectRoute, getConversations);
router.post("/dm", protectRoute, startDirectConversation);
router.post("/group", protectRoute, createGroupConversation);
router.post("/ai", protectRoute, startAIConversation);

export default router;