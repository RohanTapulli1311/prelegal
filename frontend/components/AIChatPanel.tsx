"use client";

import { useState, useRef, useEffect } from "react";

type ApiStatus = "checking" | "connected" | "disconnected";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AIChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading: boolean;
  apiStatus: ApiStatus;
  title?: string;
}

const statusConfig = {
  checking:     { dot: "bg-yellow-400", label: "Connecting..." },
  connected:    { dot: "bg-green-500",  label: "AI ready" },
  disconnected: { dot: "bg-red-400",    label: "AI offline" },
};

export default function AIChatPanel({ messages, onSend, isLoading, apiStatus, title = "Document Creator" }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#032147" }}>{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Chat with AI to fill in your agreement</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full ${statusConfig[apiStatus].dot}`} />
          {statusConfig[apiStatus].label}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
              style={msg.role === "user" ? { backgroundColor: "#209dd7" } : undefined}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white shrink-0 flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Chat message"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "#753991" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
