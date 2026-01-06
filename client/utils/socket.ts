import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  socketId: string;
}

export interface RoomState {
  roomId: string;
  userId: string;
  username: string;
  users: User[];
  messages: Message[];
}

export const getSocket = (): Socket => {
  if (!socket) {
    // In development, connect to localhost:3001
    // In production, connect to the same host (no explicit URL needed)
    const socketUrl = import.meta.env.DEV
      ? "http://localhost:3001"
      : undefined;

    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Log connection events
    socket.on("connect", () => {
      console.log("[Socket.io] Connected with ID:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket.io] Connection error:", error);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected");
    });
  }
  return socket;
};

export const joinPublicChat = (
  callback: (response: { success?: boolean; error?: string; roomId?: string; userId?: string; username?: string; users?: User[]; messages?: Message[] }) => void
) => {
  const sock = getSocket();
  sock.emit("join-public-chat", callback);
};

export const createPrivateRoom = (
  roomId: string,
  password: string,
  callback: (response: { success?: boolean; error?: string; roomId?: string; userId?: string; username?: string; users?: User[]; messages?: Message[] }) => void
) => {
  const sock = getSocket();
  sock.emit("create-private-room", { roomId, password }, callback);
};

export const joinPrivateRoom = (
  roomId: string,
  password: string,
  callback: (response: { success?: boolean; error?: string; roomId?: string; userId?: string; username?: string; users?: User[]; messages?: Message[] }) => void
) => {
  const sock = getSocket();
  sock.emit("join-private-room", { roomId, password }, callback);
};

export const sendMessage = (
  text: string,
  callback: (response: { success?: boolean; error?: string }) => void
) => {
  const sock = getSocket();
  sock.emit("send-message", { text }, callback);
};

export const exitRoom = (
  callback: (response: { success?: boolean; error?: string }) => void
) => {
  const sock = getSocket();
  sock.emit("exit-room", callback);
};

export const onMessage = (callback: (message: Message) => void) => {
  const sock = getSocket();
  sock.on("message", callback);
};

export const onUserJoined = (
  callback: (data: { username: string; usersCount: number }) => void
) => {
  const sock = getSocket();
  sock.on("user-joined", callback);
};

export const onUserLeft = (
  callback: (data: { username: string; usersCount: number }) => void
) => {
  const sock = getSocket();
  sock.on("user-left", callback);
};

export const onUsersUpdated = (callback: (users: User[]) => void) => {
  const sock = getSocket();
  sock.on("users-updated", callback);
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const offMessage = () => {
  if (socket) {
    socket.off("message");
  }
};

export const offUserJoined = () => {
  if (socket) {
    socket.off("user-joined");
  }
};

export const offUserLeft = () => {
  if (socket) {
    socket.off("user-left");
  }
};

export const offUsersUpdated = () => {
  if (socket) {
    socket.off("users-updated");
  }
};
