"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordVisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  controlId?: string;
}

export function PasswordVisibilityToggle({
  isVisible,
  onToggle,
  controlId,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-[#9299A3] hover:text-[#F2F0EA] focus:outline-none focus:text-[#D6D0C4] p-1 rounded transition-colors cursor-pointer"
      aria-label={isVisible ? "Hide passcode" : "Show passcode"}
      aria-controls={controlId}
    >
      {isVisible ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
