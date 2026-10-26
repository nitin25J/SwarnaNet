"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthenticationFeedbackProps {
  error?: string | null;
  success?: string | null;
}

export function AuthenticationFeedback({
  error,
  success,
}: AuthenticationFeedbackProps) {
  if (!error && !success) return null;

  return (
    <div className="mb-5" aria-live="polite">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-[#301C1E] border border-[#704044] text-xs text-[#E07878]"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#E07878]" aria-hidden="true" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}
      {success && (
        <div
          role="status"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-[#142A23] border border-[#285D49] text-xs text-[#48B58A]"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#48B58A]" aria-hidden="true" />
          <span className="font-medium leading-relaxed">{success}</span>
        </div>
      )}
    </div>
  );
}
