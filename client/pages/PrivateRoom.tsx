import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Plus, LogIn, ArrowLeft } from "lucide-react";
import { CreatePrivateRoomForm } from "@/components/CreatePrivateRoomForm";
import { JoinPrivateRoomForm } from "@/components/JoinPrivateRoomForm";

type Mode = "select" | "create" | "join";

export default function PrivateRoom() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("select");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden cyber-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background opacity-50" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple opacity-5 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-cyan opacity-5 blur-3xl rounded-full animate-pulse" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Header */}
        {mode !== "select" && (
          <button
            onClick={() => setMode("select")}
            className="mb-8 flex items-center gap-2 text-neon-cyan hover:text-neon-purple transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono">Back</span>
          </button>
        )}

        {mode === "select" && (
          <div className="text-center max-w-2xl w-full">
            {/* Logo */}
            <div className="mb-12">
              <div className="flex justify-center mb-6">
                <Lock className="w-16 h-16 text-neon-purple animate-glow-pulse" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black font-display text-neon-purple mb-4">
                PRIVATE
              </h1>
              <h2 className="text-3xl md:text-4xl font-black font-display text-neon-cyan mb-4">
                CHAMBER
              </h2>
              <p className="text-neon-cyan font-mono">
                Encrypted. Isolated. Secure.
              </p>
            </div>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Create Room Button */}
              <button
                onClick={() => setMode("create")}
                className="neon-button-secondary group relative overflow-hidden h-40 flex flex-col items-center justify-center gap-4 hover:bg-neon-cyan hover:text-black transition-all duration-300"
              >
                <Plus className="w-8 h-8" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold">CREATE ROOM</span>
                  <span className="text-xs opacity-70">
                    Start a new private space
                  </span>
                </div>
              </button>

              {/* Join Room Button */}
              <button
                onClick={() => setMode("join")}
                className="neon-button-secondary group relative overflow-hidden h-40 flex flex-col items-center justify-center gap-4 hover:bg-neon-purple hover:text-white transition-all duration-300"
              >
                <LogIn className="w-8 h-8" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold">JOIN ROOM</span>
                  <span className="text-xs opacity-70">
                    Enter an existing room
                  </span>
                </div>
              </button>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-8 border-t border-border">
              <div className="neon-border p-4">
                <div className="text-neon-cyan font-bold text-sm mb-2">
                  EPHEMERAL
                </div>
                <p className="text-xs text-foreground/60 font-mono">
                  Room auto-destroys when all members leave.
                </p>
              </div>

              <div className="neon-border p-4">
                <div className="text-neon-purple font-bold text-sm mb-2">
                  SECURED
                </div>
                <p className="text-xs text-foreground/60 font-mono">
                  Password protected. Only invited guests can enter.
                </p>
              </div>
            </div>

            {/* Exit button */}
            <button
              onClick={() => navigate("/")}
              className="mt-8 neon-button-secondary"
            >
              Exit to Home
            </button>
          </div>
        )}

        {mode === "create" && (
          <CreatePrivateRoomForm onSuccess={() => navigate("/")} />
        )}

        {mode === "join" && (
          <JoinPrivateRoomForm onSuccess={() => navigate("/")} />
        )}
      </div>
    </div>
  );
}
