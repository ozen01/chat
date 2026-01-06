import { Link } from "react-router-dom";
import { MessageSquare, Lock, Zap } from "lucide-react";

export default function Home() {
  const quotes = [
    "In the void, all are equal.",
    "Anonymity is freedom.",
    "No trace, no guilt.",
    "Welcome to the shadows.",
    "Chat without consequence.",
    "The network never forgets... but we do.",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden cyber-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple opacity-5 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan opacity-5 blur-3xl rounded-full animate-pulse" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main content */}
        <div className="text-center max-w-2xl w-full">
          {/* Logo/Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan opacity-20 blur-lg" />
                <Zap className="relative w-16 h-16 text-neon-cyan animate-glow-pulse" />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black font-display text-neon-cyan mb-2 animate-neon-glow">
              NEON
            </h1>
            <h2 className="text-4xl md:text-5xl font-black font-display text-neon-purple mb-6">
              VOID
            </h2>
          </div>

          {/* Description */}
          <div className="mb-12 space-y-4">
            <p className="text-lg md:text-xl text-neon-cyan font-mono">
              Anonymous Chat. No Login. No History. No Trace.
            </p>
            <p className="text-sm md:text-base text-foreground/70 font-mono">
              {randomQuote}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Public Chat Button */}
            <Link
              to="/public-chat"
              className="neon-button group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/50 to-neon-blue/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Enter Public Chat</span>
              </div>
            </Link>

            {/* Private Room Button */}
            <Link
              to="/private-room"
              className="neon-button-secondary group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <Lock className="w-5 h-5" />
                <span>Private Room</span>
              </div>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-16 pt-8 border-t border-border">
            <div className="neon-border p-4">
              <div className="text-neon-cyan font-bold text-sm mb-2">
                ANONYMOUS
              </div>
              <p className="text-xs text-foreground/60 font-mono">
                No login required. Random username every session.
              </p>
            </div>

            <div className="neon-border p-4">
              <div className="text-neon-cyan font-bold text-sm mb-2">
                EPHEMERAL
              </div>
              <p className="text-xs text-foreground/60 font-mono">
                Messages vanish on disconnect. No history stored.
              </p>
            </div>

            <div className="neon-border p-4">
              <div className="text-neon-cyan font-bold text-sm mb-2">
                PRIVATE
              </div>
              <p className="text-xs text-foreground/60 font-mono">
                Rooms auto-destroy. Complete privacy guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <div
            className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
