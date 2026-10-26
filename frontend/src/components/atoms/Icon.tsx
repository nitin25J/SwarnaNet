import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export function Icon({ className, label, children, ...props }: IconProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", className)}
      {...props}
    >
      {children}
    </span>
  );
}
