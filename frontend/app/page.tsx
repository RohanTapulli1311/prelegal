"use client";

import { useState } from "react";
import NDAForm from "@/components/NDAForm";
import NDAPreview from "@/components/NDAPreview";
import { NDAFormData, defaultFormData } from "@/lib/nda-template";

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left panel — form (hidden when printing) */}
      <div className="no-print w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
        <div className="px-8 py-10">
          <NDAForm data={formData} onChange={setFormData} />
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <NDAPreview data={formData} />
      </div>
    </main>
  );
}
