"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Database,
  CheckCircle2,
} from "lucide-react";
import { PasswordVisibilityToggle } from "./PasswordVisibilityToggle";
import { AuthenticationFeedback } from "./AuthenticationFeedback";
import {
  signInWithSupabase,
  enterGuestAnalyticalMode,
  getRememberMe,
  getSavedEmail,
  setRememberMe,
  setSavedEmail,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface TraderAuthenticationFormProps {
  onSuccess?: () => void;
}

export function TraderAuthenticationForm({
  onSuccess,
}: TraderAuthenticationFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const supabaseActive = isSupabaseConfigured();

  // Restore remembered email if set
  useEffect(() => {
    const isRemembered = getRememberMe();
    setRemember(isRemembered);
    if (isRemembered) {
      const saved = getSavedEmail();
      if (saved) setEmail(saved);
    }
  }, []);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Institutional Email is required";
    } else if (!trimmedEmail.includes("@")) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      setRememberMe(remember);
      if (remember) {
        setSavedEmail(email.trim());
      } else {
        setSavedEmail("");
      }

      const { user, error } = await signInWithSupabase(email.trim(), password);

      if (error || !user) {
        setErrorMessage(error || "Invalid institutional credentials");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Authentication verified. Redirecting to trading terminal...");
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = "/";
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error occurred";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleGuestEntry = () => {
    enterGuestAnalyticalMode();
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Feedback banner */}
      <AuthenticationFeedback
        error={errorMessage}
        success={successMessage}
      />

      {/* Supabase status notice */}
      <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
        supabaseActive
          ? "bg-[#18231C] border-[#2E5E3E] text-[#86EFAC]"
          : "bg-[#211B14] border-[#664D29] text-[#FDE047]"
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0" />
          <span>
            {supabaseActive
              ? "Supabase Auth Online"
              : "Supabase unconfigured (.env.local missing)"}
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 uppercase">
          {supabaseActive ? "Connected" : "Local Mode"}
        </span>
      </div>

      {/* Email / Trader ID field */}
      <div>
        <label
          htmlFor="trader-email"
          className="block text-xs font-mono font-medium text-[#D6D0C4] mb-1.5 uppercase tracking-wider"
        >
          Institutional Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757D8A]">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="trader-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
            }}
            placeholder="trader@swarnanet.institutional"
            className={`w-full pl-10 pr-4 py-2.5 bg-[#0B0E14] border rounded-lg text-sm font-mono text-[#F2F0EA] placeholder-[#555C68] focus:outline-none focus:ring-1 transition-all ${
              fieldErrors.email
                ? "border-[#E47777] focus:border-[#E47777] focus:ring-[#E47777]"
                : "border-[#262C35] focus:border-[#D5B16D] focus:ring-[#D5B16D]"
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="trader-password"
            className="block text-xs font-mono font-medium text-[#D6D0C4] uppercase tracking-wider"
          >
            Passcode / Security PIN
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-mono text-[#D5B16D] hover:underline"
          >
            Reset PIN?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757D8A]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="trader-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
            }}
            placeholder="••••••••••••"
            className={`w-full pl-10 pr-10 py-2.5 bg-[#0B0E14] border rounded-lg text-sm font-mono text-[#F2F0EA] placeholder-[#555C68] focus:outline-none focus:ring-1 transition-all ${
              fieldErrors.password
                ? "border-[#E47777] focus:border-[#E47777] focus:ring-[#E47777]"
                : "border-[#262C35] focus:border-[#D5B16D] focus:ring-[#D5B16D]"
            }`}
          />
          <PasswordVisibilityToggle
            isVisible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.password}</p>
        )}
      </div>

      {/* Remember me checkbox */}
      <div className="flex items-center justify-between text-xs font-mono">
        <label className="flex items-center gap-2 cursor-pointer text-[#9CA3AF]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded bg-[#0B0E14] border-[#262C35] text-[#D5B16D] focus:ring-[#D5B16D] h-3.5 w-3.5"
          />
          <span>Remember Device</span>
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-[#D5B16D] hover:bg-[#E5C17D] text-[#0B0E14] font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            <span>Authenticate Trader</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* Local Guest Auditor Exploration Mode */}
      <div className="pt-2 border-t border-[#262C35]">
        <button
          type="button"
          onClick={handleGuestEntry}
          className="w-full py-2.5 px-4 rounded-lg bg-[#181C24] hover:bg-[#222834] text-[#E5E7EB] font-mono text-xs border border-[#2E3644] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4 text-[#D5B16D]" />
          <span>Launch Terminal (Auditor Mode)</span>
        </button>
        <p className="text-[10px] text-center font-mono text-[#6B7280] mt-1.5">
          Zero mock data. Full access to verified 3,269 canonical observations & analytical models.
        </p>
      </div>

      {/* Sign up link */}
      <div className="pt-2 text-center text-xs font-mono text-[#858D97]">
        <span>New institutional desk? </span>
        <Link href="/signup" className="text-[#D5B16D] hover:underline font-semibold">
          Register Trader Account
        </Link>
      </div>
    </form>
  );
}
