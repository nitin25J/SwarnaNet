import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isActive?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#D6D0C4] text-[#17191C] font-semibold hover:bg-[#E5E0D6] focus-visible:outline-[#8995A3]",
  secondary:
    "bg-[#1C1F22] text-[#F2F0EA] border border-[#34383D] hover:bg-[#24282D] focus-visible:outline-[#8995A3]",
  ghost: "bg-transparent text-[#C4C7CC] hover:bg-[#24282D] hover:text-[#F2F0EA]",
  outline:
    "border border-[#34383D] bg-[#181A1D] text-[#F2F0EA] hover:bg-[#24282D] hover:border-[#8995A3]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isActive = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        isActive && variant === "outline" && "border-[#8995A3] bg-[#D6D0C4] text-[#17191C]",
        className,
      )}
      {...props}
    />
  );
}
