"use client";

import { useState, useEffect } from "react";
import AIChatPanel, { ChatMessage } from "@/components/AIChatPanel";
import NDAPreview from "@/components/NDAPreview";
import { NDAFormData, defaultFormData } from "@/lib/nda-template";

type ApiStatus = "checking" | "connected" | "disconnected";

const INITIAL_GREETING =
  "Hi! I can help you create a Mutual Non-Disclosure Agreement. Let's start — what's the purpose of this NDA? For example: evaluating a potential business partnership, sharing technology for a joint project, etc.";

function mergeFields(current: NDAFormData, updates: Record<string, unknown>): NDAFormData {
  const merged = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value !== null && value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: INITIAL_GREETING },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((r) => r.ok ? setApiStatus("connected") : setApiStatus("disconnected"))
      .catch(() => setApiStatus("disconnected"));
  }, []);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, current_fields: formData }),
      });
      const data = await response.json();
      setFormData((current) => mergeFields(current, data.fields ?? {}));
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left panel — AI chat (hidden when printing) */}
      <div className="no-print w-1/2 border-r border-gray-200 bg-white flex flex-col">
        <AIChatPanel
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          apiStatus={apiStatus}
        />
      </div>

      {/* Right panel — live preview */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <NDAPreview data={formData} />
      </div>
    </main>
  );
}
