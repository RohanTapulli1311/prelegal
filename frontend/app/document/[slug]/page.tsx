"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import AIChatPanel, { ChatMessage } from "@/components/AIChatPanel";
import DocumentPreview from "@/components/DocumentPreview";
import Header from "@/components/Header";
import { getDocumentConfig } from "@/lib/documents/index";
import { apiFetch } from "@/lib/api";

type ApiStatus = "checking" | "connected" | "disconnected";
type SaveStatus = "idle" | "saving" | "saved";

function mergeFields(
  current: Record<string, string>,
  updates: Record<string, unknown>
): Record<string, string> {
  const merged = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value !== null && value !== undefined) {
      merged[key] = String(value);
    }
  }
  return merged;
}

export default function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const config = getDocumentConfig(slug);

  if (!config) notFound();

  const [formData, setFormData] = useState<Record<string, string>>(config.defaultData);
  const [documentId, setDocumentId] = useState<number | null>(
    searchParams.get("doc") ? Number(searchParams.get("doc")) : null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I can help you create a ${config.name}. Let's get started — ${getOpeningQuestion(slug)}`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Health check
  useEffect(() => {
    apiFetch("/health")
      .then((r) => (r.ok ? setApiStatus("connected") : setApiStatus("disconnected")))
      .catch(() => setApiStatus("disconnected"));
  }, []);

  // Load saved document if doc param present
  useEffect(() => {
    const docId = searchParams.get("doc");
    if (!docId) return;
    apiFetch(`/documents/${docId}`)
      .then(async (r) => {
        if (r.ok) {
          const doc = await r.json();
          setFormData((current) => mergeFields(current, doc.fields));
          setDocumentId(doc.id);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setSaveStatus("saving");

    try {
      const response = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: updatedMessages,
          current_fields: formData,
          document_type: slug,
          document_id: documentId,
        }),
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();

      const merged = mergeFields(formData, data.fields ?? {});
      setFormData(merged);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.document_id) {
        setDocumentId(data.document_id);
        // Update URL without navigation
        window.history.replaceState(null, "", `/document/${slug}?doc=${data.document_id}`);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
      setSaveStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header title={config.name} />
      <main className="flex flex-1 overflow-hidden bg-gray-50">
        <div className="no-print w-1/2 border-r border-gray-200 bg-white flex flex-col">
          <AIChatPanel
            messages={messages}
            onSend={sendMessage}
            isLoading={isLoading}
            apiStatus={apiStatus}
            title={`${config.name} Creator`}
          />
        </div>
        <div className="w-1/2 overflow-y-auto bg-gray-50 flex flex-col">
          <DocumentPreview
            config={config}
            data={formData}
            saveStatus={saveStatus}
          />
        </div>
      </main>
    </div>
  );
}

function getOpeningQuestion(slug: string): string {
  const questions: Record<string, string> = {
    "mutual-nda": "what's the purpose of this NDA?",
    "mutual-nda-coverpage": "what's the purpose of this NDA?",
    "csa": "can you tell me about the cloud service being offered and the subscription period?",
    "sla": "what are your uptime targets and support response time commitments?",
    "design-partner": "tell me about the design partner program — what product is involved and who are the parties?",
    "psa": "what professional services will be provided, and who are the two parties?",
    "dpa": "what types of personal data will be processed, and what's the purpose of the processing?",
    "partnership": "what type of partnership is this — reseller, referral, or integration? And what are the key obligations for each party?",
    "software-license": "what software is being licensed and for what permitted uses?",
    "pilot": "what product is being piloted and how long is the pilot period?",
    "baa": "what services will involve protected health information (PHI)?",
    "ai-addendum": "will you permit the provider to use your data for AI model training?",
  };
  return questions[slug] ?? "who are the parties involved?";
}
