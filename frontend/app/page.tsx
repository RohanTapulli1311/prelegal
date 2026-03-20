"use client";

import { useState, useEffect } from "react";
import NDAForm from "@/components/NDAForm";
import NDAPreview from "@/components/NDAPreview";
import { NDAFormData, defaultFormData } from "@/lib/nda-template";

type ApiStatus = "checking" | "connected" | "disconnected";

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((r) => r.ok ? setApiStatus("connected") : setApiStatus("disconnected"))
      .catch(() => setApiStatus("disconnected"));
  }, []);

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left panel — form (hidden when printing) */}
      <div className="no-print w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
        <div className="px-8 py-10">
          <NDAForm data={formData} onChange={setFormData} apiStatus={apiStatus} />
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <NDAPreview data={formData} />
      </div>
    </main>
  );
}
