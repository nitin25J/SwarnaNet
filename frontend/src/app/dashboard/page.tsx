"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SwarnanetTerminal } from "@/components/terminal/SwarnanetTerminal";
import { isAuthenticated, enterGuestAnalyticalMode } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Enable frictionless judge & evaluator demo access:
    // If no existing session is found, auto-initialize read-only Institutional Auditor demo mode.
    if (!isAuthenticated()) {
      enterGuestAnalyticalMode();
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0D0F11] flex items-center justify-center text-xs font-mono text-[#757D88]">
        Loading SwarnaNet Terminal...
      </div>
    );
  }

  return (
    <SwarnanetTerminal
      onSignOut={() => {
        router.push("/login");
      }}
    />
  );
}
