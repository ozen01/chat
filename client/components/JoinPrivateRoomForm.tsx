import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinPrivateRoom } from "@/utils/socket";
import { AlertCircle } from "lucide-react";

interface JoinPrivateRoomFormProps {
  onSuccess: () => void;
}

export function JoinPrivateRoomForm({ onSuccess }: JoinPrivateRoomFormProps) {
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

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    joinPrivateRoom(roomId, password, (response) => {
      setIsLoading(false);

      if (response.success) {
        // Redirect to private chat room
        navigate(`/chat/private/${roomId}`);
      } else {
        setError(response.error || "Failed to join room");
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="neon-border p-8 bg-card">
        <h2 className="text-2xl font-bold font-display text-neon-purple mb-6">
          JOIN ROOM
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room ID Input */}
          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-mono text-neon-purple mb-2"
            >
              ROOM ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="e.g., NEXUS-01"
              className="w-full bg-input border border-border px-4 py-3 rounded-none text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-purple font-mono uppercase"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-mono text-neon-purple mb-2"
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-input border border-border px-4 py-3 rounded-none text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-purple font-mono"
              disabled={isLoading}
            />
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
            className="neon-button-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed bg-neon-purple text-white hover:bg-neon-purple/80"
          >
            {isLoading ? "JOINING..." : "JOIN ROOM"}
          </button>
        </form>
      </div>
    </div>
  );
}
