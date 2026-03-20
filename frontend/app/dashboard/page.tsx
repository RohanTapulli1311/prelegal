"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { getDocumentConfig } from "@/lib/documents/index";
import { apiFetch } from "@/lib/api";

interface SavedDocument {
  id: number;
  slug: string;
  fields: Record<string, string>;
  created_at: string;
  updated_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/documents")
      .then(async (r) => {
        if (r.status === 401) {
          router.push("/login");
          return;
        }
        const data = await r.json();
        setDocuments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#032147" }}>
                My Documents
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Your saved legal document drafts
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium px-4 py-2 rounded-xl text-white transition-colors"
              style={{ backgroundColor: "#753991" }}
            >
              New document
            </Link>
          </div>

          {loading && (
            <div className="text-sm text-gray-500 text-center py-12">
              Loading...
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-sm mb-4">
                No documents yet. Start by creating one.
              </p>
              <Link
                href="/"
                className="text-sm font-medium px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: "#209dd7" }}
              >
                Browse document types
              </Link>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const config = getDocumentConfig(doc.slug);
                const displayName = config?.name ?? doc.slug;
                const party1 = doc.fields.party1Company || doc.fields.party1Name;
                const party2 = doc.fields.party2Company || doc.fields.party2Name;
                const subtitle =
                  party1 && party2
                    ? `${party1} & ${party2}`
                    : party1 || "Parties not yet set";

                return (
                  <button
                    key={doc.id}
                    onClick={() => router.push(`/document/${doc.slug}?doc=${doc.id}`)}
                    className="text-left p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div
                      className="text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors"
                      style={{ color: "#032147" }}
                    >
                      {displayName}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 truncate">{subtitle}</p>
                    <p className="text-xs text-gray-400">
                      Last edited {formatDate(doc.updated_at)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
