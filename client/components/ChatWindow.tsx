import { useEffect, useRef, useState } from "react";
import { Send, LogOut, Users } from "lucide-react";
import { Message, User } from "@/utils/socket";

interface ChatWindowProps {
  roomId: string;
  username: string;
  messages: Message[];
  users: User[];
  onSendMessage: (text: string) => void;
  onExit: () => void;
}

export function ChatWindow({
  roomId,
  username,
  messages,
  users,
  onSendMessage,
  onExit,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden cyber-grid">
      {/* Header */}
      <div className="neon-border px-6 py-4 bg-card border-b border-t-0 border-l-0 border-r-0 flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neon-cyan font-display">
            {roomId === "public" ? "PUBLIC VOID" : "PRIVATE CHAMBER"}
          </h1>
          <p className="text-sm text-foreground/60 font-mono">
            {roomId === "public"
              ? "Everyone can see your messages"
              : "Only room members can see messages"}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-neon-cyan">
            <Users className="w-5 h-5" />
            <span className="font-mono text-sm font-bold">{users.length}</span>
          </div>
          <button
            onClick={onExit}
            className="p-2 hover:bg-neon-cyan/10 rounded-none transition-colors duration-200 hover:text-neon-cyan"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-neon-purple font-mono text-lg mb-2">
                {roomId === "public"
                  ? "The void awaits your words..."
                  : "A private sanctuary..."}
              </p>
              <p className="text-foreground/50 text-sm">
                Be the first to speak
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUserMessage = message.username === username;
            return (
              <div
                key={message.id}
                className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs ${isUserMessage ? "chat-message-user" : "chat-message-other"}`}>
                  <div className="text-xs text-foreground/60 font-mono mb-1">
                    {message.username}
                  </div>
                  <div className="chat-message-bubble">
                    <p>{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="neon-border px-6 py-4 bg-card border-t border-b-0 border-l-0 border-r-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-input border border-border px-4 py-3 rounded-none text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="neon-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
