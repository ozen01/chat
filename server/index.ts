import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Types
interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

interface User {
  id: string;
  username: string;
  socketId: string;
}

interface Room {
  id: string;
  type: "public" | "private";
  password?: string;
  messages: Message[];
  users: Map<string, User>;
  createdAt: number;
}

// In-memory storage
const rooms = new Map<string, Room>();
const userSockets = new Map<string, { roomId: string; userId: string }>();

function generateRandomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateUsername(): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Anon-${randomPart}`;
}

function createRoom(id: string, type: "public" | "private", password?: string): Room {
  return {
    id,
    type,
    password,
    messages: [],
    users: new Map(),
    createdAt: Date.now(),
  };
}

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Initialize public chat room
  if (!rooms.has("public")) {
    rooms.set("public", createRoom("public", "public"));
  }

  // Socket.io events
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join public chat
    socket.on("join-public-chat", (callback) => {
      try {
        const room = rooms.get("public");
        if (!room) {
          callback({ error: "Room not found" });
          return;
        }

        const userId = generateRandomId("user");
        const username = generateUsername();

        const user: User = { id: userId, username, socketId: socket.id };
        room.users.set(userId, user);
        userSockets.set(socket.id, { roomId: "public", userId });

        socket.join("public");

        // Send room state to the user
        callback({
          success: true,
          roomId: "public",
          userId,
          username,
          users: Array.from(room.users.values()),
          messages: room.messages,
        });

        // Notify others
        socket.to("public").emit("user-joined", {
          username,
          usersCount: room.users.size,
        });

        io.to("public").emit("users-updated", Array.from(room.users.values()));
      } catch (error) {
        console.error("Error joining public chat:", error);
        callback({ error: "Failed to join chat" });
      }
    });

    // Create private room
    socket.on("create-private-room", (data, callback) => {
      try {
        const { roomId, password } = data;

        if (!roomId || !password) {
          callback({ error: "Room ID and password are required" });
          return;
        }

        if (rooms.has(roomId)) {
          callback({ error: "Room ID already exists" });
          return;
        }

        const room = createRoom(roomId, "private", password);
        rooms.set(roomId, room);

        const userId = generateRandomId("user");
        const username = generateUsername();

        const user: User = { id: userId, username, socketId: socket.id };
        room.users.set(userId, user);
        userSockets.set(socket.id, { roomId, userId });

        socket.join(roomId);

        callback({
          success: true,
          roomId,
          userId,
          username,
          users: Array.from(room.users.values()),
          messages: room.messages,
        });

        console.log(`Private room created: ${roomId}`);
      } catch (error) {
        console.error("Error creating private room:", error);
        callback({ error: "Failed to create room" });
      }
    });

    // Join private room
    socket.on("join-private-room", (data, callback) => {
      try {
        const { roomId, password } = data;

        if (!roomId || !password) {
          callback({ error: "Room ID and password are required" });
          return;
        }

        const room = rooms.get(roomId);
        if (!room) {
          callback({ error: "Room not found" });
          return;
        }

        if (room.type !== "private") {
          callback({ error: "This is not a private room" });
          return;
        }

        if (room.password !== password) {
          callback({ error: "Incorrect password" });
          return;
        }

        const userId = generateRandomId("user");
        const username = generateUsername();

        const user: User = { id: userId, username, socketId: socket.id };
        room.users.set(userId, user);
        userSockets.set(socket.id, { roomId, userId });

        socket.join(roomId);

        callback({
          success: true,
          roomId,
          userId,
          username,
          users: Array.from(room.users.values()),
          messages: room.messages,
        });

        // Notify others in the room
        socket.to(roomId).emit("user-joined", {
          username,
          usersCount: room.users.size,
        });

        io.to(roomId).emit("users-updated", Array.from(room.users.values()));

        console.log(`User joined private room: ${roomId}`);
      } catch (error) {
        console.error("Error joining private room:", error);
        callback({ error: "Failed to join room" });
      }
    });

    // Send message
    socket.on("send-message", (data, callback) => {
      try {
        const { text } = data;
        const userInfo = userSockets.get(socket.id);

        console.log(`[Message] User ${socket.id} sending message. UserInfo:`, userInfo);

        if (!userInfo) {
          callback({ error: "User not found in room" });
          return;
        }

        const room = rooms.get(userInfo.roomId);
        if (!room) {
          callback({ error: "Room not found" });
          return;
        }

        const user = room.users.get(userInfo.userId);
        if (!user) {
          callback({ error: "User not in this room" });
          return;
        }

        const message: Message = {
          id: generateRandomId("msg"),
          username: user.username,
          text,
          timestamp: Date.now(),
        };

        room.messages.push(message);

        // Keep only last 100 messages to limit memory usage
        if (room.messages.length > 100) {
          room.messages.shift();
        }

        console.log(`[Message] Broadcasting to room ${userInfo.roomId}:`, message);
        io.to(userInfo.roomId).emit("message", message);
        callback({ success: true });
      } catch (error) {
        console.error("Error sending message:", error);
        callback({ error: "Failed to send message" });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userInfo = userSockets.get(socket.id);
      if (userInfo) {
        const room = rooms.get(userInfo.roomId);
        if (room) {
          const user = room.users.get(userInfo.userId);
          room.users.delete(userInfo.userId);

          // Notify others
          if (room.users.size > 0) {
            io.to(userInfo.roomId).emit("user-left", {
              username: user?.username,
              usersCount: room.users.size,
            });
            io.to(userInfo.roomId).emit("users-updated", Array.from(room.users.values()));
          } else {
            // Auto-destroy room if empty (except public room)
            if (userInfo.roomId !== "public") {
              rooms.delete(userInfo.roomId);
              console.log(`Private room destroyed: ${userInfo.roomId}`);
            }
          }
        }
        userSockets.delete(socket.id);
      }
      console.log(`User disconnected: ${socket.id}`);
    });

    // Handle exit room
    socket.on("exit-room", (callback) => {
      try {
        const userInfo = userSockets.get(socket.id);
        if (!userInfo) {
          callback({ error: "User not found" });
          return;
        }

        const room = rooms.get(userInfo.roomId);
        if (room) {
          const user = room.users.get(userInfo.userId);
          room.users.delete(userInfo.userId);

          // Notify others
          if (room.users.size > 0) {
            socket.to(userInfo.roomId).emit("user-left", {
              username: user?.username,
              usersCount: room.users.size,
            });
            io.to(userInfo.roomId).emit("users-updated", Array.from(room.users.values()));
          } else {
            // Auto-destroy room if empty (except public room)
            if (userInfo.roomId !== "public") {
              rooms.delete(userInfo.roomId);
              console.log(`Private room destroyed: ${userInfo.roomId}`);
            }
          }
        }

        socket.leave(userInfo.roomId);
        userSockets.delete(socket.id);
        callback({ success: true });
      } catch (error) {
        console.error("Error exiting room:", error);
        callback({ error: "Failed to exit room" });
      }
    });
  });

  // Return both the express app and the http server for the node-build.ts
  const expressApp = Object.assign(app, { _httpServer: httpServer, _io: io });
  return expressApp as any;
}
