import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatWindow } from "@/components/ChatWindow";
import {
  joinPublicChat,
  sendMessage,
  exitRoom,
  onMessage,
  onUsersUpdated,
  offMessage,
  offUsersUpdated,
  Message,
  User,
  disconnect,
} from "@/utils/socket";

export default function PublicChat() {
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<{
    roomId: string;
    userId: string;
    username: string;
    users: User[];
    messages: Message[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Join public chat
    joinPublicChat((response) => {
      if (response.success) {
        setRoomState({
          roomId: response.roomId || "public",
          userId: response.userId || "",
          username: response.username || "",
          users: response.users || [],
          messages: response.messages || [],
        });
        setError(null);
      } else {
        setError(response.error || "Failed to join chat");
      }
      setIsLoading(false);
    });

    // Listen for new messages
    const handleMessage = (message: Message) => {
      console.log("[Client] Received message:", message);
      setRoomState((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, message],
            }
          : null
      );
    };

    // Listen for users update
    const handleUsersUpdated = (users: User[]) => {
      setRoomState((prev) =>
        prev
          ? {
              ...prev,
              users,
            }
          : null
      );
    };

    onMessage(handleMessage);
    onUsersUpdated(handleUsersUpdated);

    return () => {
      offMessage();
      offUsersUpdated();
    };
  }, []);

  const handleSendMessage = (text: string) => {
    sendMessage(text, (response) => {
      if (!response.success) {
        setError(response.error || "Failed to send message");
      }
    });
  };

  const handleExit = () => {
    exitRoom((response) => {
      if (response.success) {
        disconnect();
        navigate("/");
      } else {
        setError(response.error || "Failed to exit room");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center cyber-grid">
        <div className="text-center">
          <div className="text-4xl font-display text-neon-cyan animate-neon-glow mb-4">
            CONNECTING...
          </div>
          <p className="text-foreground/60 font-mono">Entering the void</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center cyber-grid">
        <div className="text-center max-w-md">
          <div className="text-2xl font-display text-neon-purple mb-4">
            ERROR
          </div>
          <p className="text-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="neon-button"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return null;
  }

  return (
    <ChatWindow
      roomId={roomState.roomId}
      username={roomState.username}
      messages={roomState.messages}
      users={roomState.users}
      onSendMessage={handleSendMessage}
      onExit={handleExit}
    />
  );
}
