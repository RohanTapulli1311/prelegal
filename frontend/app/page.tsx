"use client";

import { useState } from "react";
import NDAForm from "@/components/NDAForm";
import NDAPreview from "@/components/NDAPreview";
import { NDAFormData, defaultFormData } from "@/lib/nda-template";

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50">
      {showPreview ? (
        <NDAPreview data={formData} onBack={() => setShowPreview(false)} />
      ) : (
        <div className="py-12 px-6">
          <NDAForm
            data={formData}
            onChange={setFormData}
            onPreview={() => setShowPreview(true)}
          />
        </div>
      )}
    </main>
  );
}
