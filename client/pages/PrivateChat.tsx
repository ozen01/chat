import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatWindow } from "@/components/ChatWindow";
import {
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

export default function PrivateChat() {
  const { roomId } = useParams<{ roomId: string }>();
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
    // This page should only be accessed after successfully joining a room
    // The room state should be passed through the socket connection
    // For now, we'll set up the listeners and wait for the server to send room state

    // Listen for new messages
    const handleMessage = (message: Message) => {
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

    // Initialize room state from Socket.io if available
    // This is a placeholder - the actual room state comes from the server
    if (roomId) {
      setRoomState({
        roomId,
        userId: "",
        username: "",
        users: [],
        messages: [],
      });
      setIsLoading(false);
    }

    onMessage(handleMessage);
    onUsersUpdated(handleUsersUpdated);

    return () => {
      offMessage();
      offUsersUpdated();
    };
  }, [roomId]);

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

  if (isLoading || !roomState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center cyber-grid">
        <div className="text-center">
          <div className="text-4xl font-display text-neon-purple animate-neon-glow mb-4">
            CONNECTING...
          </div>
          <p className="text-foreground/60 font-mono">Initializing secure channel</p>
        </div>
      </div>
    );
  }

  if (error && !roomState.userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center cyber-grid">
        <div className="text-center max-w-md">
          <div className="text-2xl font-display text-neon-purple mb-4">
            CONNECTION ERROR
          </div>
          <p className="text-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/private-room")}
            className="neon-button"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
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
