import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { Icon } from "@/components/atoms/Icon";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: "brand" | "success" | "warning" | "neutral";
}

const iconTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-[#1C1F22] text-[#D6D0C4] border border-[#34383D]",
  success: "bg-[#142A23] text-[#48B58A] border border-[#285D49]",
  warning: "bg-[#301C1E] text-[#E07878] border border-[#704044]",
  neutral: "bg-[#222831] text-[#AEB4BD] border border-[#414750]",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#9299A3]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#E6E1D6]">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-sm text-[#9299A3]">
              <Badge tone={tone === "brand" ? "brand" : tone}>{hint}</Badge>
            </p>
          ) : null}
        </div>
        <Icon className={iconTone[tone]}>{icon}</Icon>
      </div>
    </Card>
  );
}
