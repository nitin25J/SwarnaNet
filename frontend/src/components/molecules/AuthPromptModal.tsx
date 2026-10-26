"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, X, ShieldAlert } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  title = "Authentication Required",
  message = "Please sign in to access data ingestion and store synchronization.",
}: AuthPromptModalProps) {
  const router = useRouter();

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    router.push("/login");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[#34383D] bg-[#181A1D] p-6 shadow-2xl text-[#F2F0EA]">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#9299A3] hover:bg-[#24282D] hover:text-[#F2F0EA] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1C1F22] text-[#D6D0C4] border border-[#34383D]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3
              id="auth-prompt-title"
              className="text-lg font-bold text-[#F2F0EA] font-serif tracking-tight"
            >
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#9299A3] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Security badge notice */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#292D32] bg-[#111316] p-3 text-xs text-[#F2F0EA]">
          <ShieldAlert className="h-4 w-4 text-[#AEB4BD] shrink-0" />
          <span>Public access is view-only. Modifications require verified role credentials.</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-[#F2F0EA] bg-[#1C1F22] hover:bg-[#24282D] transition-colors border border-[#34383D]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSignIn}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#D6D0C4] hover:bg-[#E5E0D6] text-[#17191C] border border-[#8995A3] transition-colors active:scale-[0.99]"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
