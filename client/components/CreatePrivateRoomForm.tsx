import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPrivateRoom, Message, User } from "@/utils/socket";
import { AlertCircle } from "lucide-react";

interface CreatePrivateRoomFormProps {
  onSuccess: () => void;
}

export function CreatePrivateRoomForm({
  onSuccess,
}: CreatePrivateRoomFormProps) {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomId.trim()) {
      setError("Room ID is required");
      return;
    }

    if (!/^[A-Za-z0-9-_]+$/.test(roomId)) {
      setError(
        "Room ID can only contain letters, numbers, hyphens, and underscores",
      );
      return;
    }

    if (roomId.length > 32) {
      setError("Room ID must be 32 characters or less");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setIsLoading(true);

    createPrivateRoom(roomId, password, (response) => {
      setIsLoading(false);

      if (response.success) {
        // Pass room state through navigation so PrivateChat can use it
        navigate(`/chat/private/${roomId}`, {
          state: {
            userId: response.userId,
            username: response.username,
            users: response.users,
            messages: response.messages,
          },
        });
      } else {
        setError(response.error || "Failed to create room");
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="neon-border p-8 bg-card">
        <h2 className="text-2xl font-bold font-display text-neon-cyan mb-6">
          CREATE NEW ROOM
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room ID Input */}
          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-mono text-neon-cyan mb-2"
            >
              ROOM ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="e.g., NEXUS-01"
              maxLength={32}
              className="w-full bg-input border border-border px-4 py-3 rounded-none text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan font-mono uppercase"
              disabled={isLoading}
            />
            <p className="text-xs text-foreground/50 font-mono mt-1">
              Letters, numbers, hyphens, underscores only
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-mono text-neon-cyan mb-2"
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={4}
              maxLength={32}
              className="w-full bg-input border border-border px-4 py-3 rounded-none text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-foreground/50 font-mono mt-1">
              Minimum 4 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/20 border border-destructive px-4 py-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="neon-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "CREATING..." : "CREATE ROOM"}
          </button>
        </form>
      </div>
    </div>
  );
}
