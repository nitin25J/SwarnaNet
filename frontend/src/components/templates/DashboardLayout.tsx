import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#101113] text-[#F2F0EA] selection:bg-[#D6D0C4] selection:text-[#17191C] relative overflow-x-clip">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}
