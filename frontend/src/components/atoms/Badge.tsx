import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "success" | "warning" | "neutral" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-[#142A23] text-[#48B58A] ring-[#285D49]",
  warning: "bg-[#301C1E] text-[#E07878] ring-[#704044]",
  neutral: "bg-[#222831] text-[#AEB4BD] ring-[#414750]",
  brand: "bg-[#1C1F22] text-[#D6D0C4] ring-[#34383D]",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
