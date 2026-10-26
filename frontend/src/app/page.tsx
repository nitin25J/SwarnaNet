"use client";

import React, { useState, useEffect } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInCard } from "@/components/auth/SignInCard";
import { SwarnanetTerminal } from "@/components/terminal/SwarnanetTerminal";
import { isAuthenticated } from "@/lib/auth";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user is currently authenticated
    setIsLoggedIn(isAuthenticated());
  }, []);

  // During SSR and initial mount, render Login shell so user lands on Login screen first
  if (!isMounted) {
    return (
      <AuthLayout>
        <SignInCard onLoginSuccess={() => setIsLoggedIn(true)} />
      </AuthLayout>
    );
  }

  // Not authenticated: render Login interface
  if (!isLoggedIn) {
    return (
      <AuthLayout>
        <SignInCard onLoginSuccess={() => setIsLoggedIn(true)} />
      </AuthLayout>
    );
  }

  // Authenticated: transition cleanly to SWARNANET terminal
  return <SwarnanetTerminal onSignOut={() => setIsLoggedIn(false)} />;
}
