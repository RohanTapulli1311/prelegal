"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NDAFormData, buildCoverPageMarkdown, buildStandardTermsMarkdown } from "@/lib/nda-template";

interface NDAPreviewProps {
  data: NDAFormData;
  onBack: () => void;
}

export default function NDAPreview({ data, onBack }: NDAPreviewProps) {
  const coverPage = buildCoverPageMarkdown(data);
  const standardTerms = buildStandardTermsMarkdown(data);

  const handleDownload = () => {
    const fullContent = coverPage + "\n\n---\n\n" + standardTerms;
    const blob = new Blob([fullContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Mutual-NDA.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Action bar — hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Form
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Download .md
          </button>
          <button
            onClick={handlePrint}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download / Print PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto px-6 py-10 print:py-4 print:px-0">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{coverPage}</ReactMarkdown>
        </div>
        <div className="my-8 border-t border-gray-300 print:my-6" />
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{standardTerms}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
