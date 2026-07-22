import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

const userSocketMap = {}; // userId -> socketId

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("typing", ({ conversationId, participantIds = [] }) => {
        participantIds
            .filter((id) => id !== userId)
            .forEach((id) => {
                const socketId = getReceiverSocketId(id);
                if (socketId) io.to(socketId).emit("typing", { conversationId, userId });
            });
    });

    socket.on("stopTyping", ({ conversationId, participantIds = [] }) => {
        participantIds
            .filter((id) => id !== userId)
            .forEach((id) => {
                const socketId = getReceiverSocketId(id);
                if (socketId) io.to(socketId).emit("stopTyping", { conversationId, userId });
            });
    });

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };