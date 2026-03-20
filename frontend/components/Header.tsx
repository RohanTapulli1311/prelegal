"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header
      className="no-print h-12 flex items-center px-4 shrink-0 border-b border-white/10"
      style={{ backgroundColor: "#032147" }}
    >
      {/* Left: back button or app name */}
      <div className="w-40 flex items-center">
        {title ? (
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
            All documents
          </button>
        ) : (
          <Link href="/" className="text-sm font-semibold text-white">
            PreLegal
          </Link>
        )}
      </div>

      {/* Centre: document title */}
      <div className="flex-1 text-center">
        {title && (
          <span className="text-sm font-semibold text-white">{title}</span>
        )}
      </div>

      {/* Right: user info + logout */}
      <div className="w-40 flex items-center justify-end gap-3">
        {user && (
          <>
            <Link
              href="/dashboard"
              className="text-xs text-white/70 hover:text-white transition-colors"
            >
              {user.name}
            </Link>
            <button
              onClick={logout}
              className="text-xs text-white/60 hover:text-white transition-colors border border-white/20 rounded-lg px-2.5 py-1 hover:border-white/40"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
