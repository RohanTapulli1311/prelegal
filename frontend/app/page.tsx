"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AIChatPanel, { ChatMessage } from "@/components/AIChatPanel";
import { allDocuments } from "@/lib/documents/index";

type ApiStatus = "checking" | "connected" | "disconnected";

const INITIAL_GREETING =
  "Hi! I can help you find and create the right legal document. What kind of agreement do you need? You can also click any document type on the right to get started directly.";

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: INITIAL_GREETING },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((r) => (r.ok ? setApiStatus("connected") : setApiStatus("disconnected")))
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
        body: JSON.stringify({ messages: updatedMessages, current_fields: {}, document_type: null }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.suggested_document_type) {
        setTimeout(() => router.push(`/document/${data.suggested_document_type}`), 800);
      }
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
      {/* Left panel — AI assistant chat */}
      <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
        <AIChatPanel
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          apiStatus={apiStatus}
          title="Legal Document Assistant"
        />
      </div>

      {/* Right panel — document type cards */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <div className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-base font-semibold" style={{ color: "#032147" }}>
            Available Document Types
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Click any document to start creating it</p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {allDocuments.map((doc) => (
            <button
              key={doc.slug}
              onClick={() => router.push(`/document/${doc.slug}`)}
              className="text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <div
                className="text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors"
                style={{ color: "#032147" }}
              >
                {doc.name}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {doc.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
