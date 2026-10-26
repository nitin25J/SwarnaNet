import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ label: string; value: string }>;
}

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-[#292D32] bg-[#111316] px-3 text-sm text-[#F2F0EA] shadow-inner outline-none transition-colors focus:border-[#8995A3] focus:ring-1 focus:ring-[#8995A3]",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
