"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NDAFormData, buildCoverPageMarkdown, buildStandardTermsMarkdown } from "@/lib/nda-template";

interface NDAPreviewProps {
  data: NDAFormData;
}

export default function NDAPreview({ data }: NDAPreviewProps) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header with download buttons */}
      <div className="no-print sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Live Preview</span>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          >
            Download .md
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Document content */}
      <div className="px-8 py-8 print:py-4 print:px-0">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{coverPage}</ReactMarkdown>
        </div>
        <div className="my-6 border-t border-gray-300 print:my-4" />
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{standardTerms}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
