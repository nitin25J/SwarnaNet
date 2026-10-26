import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export function Input({ className, isInvalid = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border bg-[#111316] px-3 text-sm text-[#F2F0EA] shadow-inner outline-none transition-colors placeholder:text-[#9299A3]/40 focus:border-[#8995A3] focus:ring-1 focus:ring-[#8995A3]",
        isInvalid
          ? "border-[#E07878] focus:border-[#E07878] focus:ring-[#E07878]/30"
          : "border-[#292D32]",
        className,
      )}
      {...props}
    />
  );
}
