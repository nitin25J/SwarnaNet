"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Database,
} from "lucide-react";
import { signUpWithSupabase } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function SignUpCard() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [clearingMemberId, setClearingMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    clearingMemberId?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const supabaseActive = isSupabaseConfigured();

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!fullName.trim()) errors.fullName = "Trader/Analyst name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid institutional email required";
    if (!password || password.length < 8) errors.password = "Passcode must be at least 8 characters";
    if (password !== confirmPassword) errors.confirmPassword = "Passcodes do not match";
    if (!agreeTerms) errors.terms = "Trading desk compliance agreement required";

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
      const { success, error } = await signUpWithSupabase(email.trim(), password, fullName.trim());

      if (error || !success) {
        setErrorMessage(error || "Registration failed");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully via Supabase Auth! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please check network connection.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      <div className="relative rounded-2xl border border-white/10 bg-[#12161E]/90 backdrop-blur-xl p-7 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#1C1F22] border border-[#34383D] text-[#D5B16D] mb-2">
            <UserCheck className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#F2F0EA]">
            SWARNANET // Terminal Registration
          </h2>
          <p className="text-xs text-[#9299A3] mt-1 font-mono">
            Provision access to MCX Bullion Cross-Contract Terminal
          </p>
        </div>

        {/* Supabase status notice */}
        <div className={`p-3 rounded-lg border text-xs font-mono mb-4 flex items-center justify-between ${
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
            {supabaseActive ? "Active" : "Notice"}
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-[#301C1E] border border-[#704044] text-xs font-mono text-[#E47777] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-lg bg-[#18231C] border border-[#2E5E3E] text-xs font-mono text-[#86EFAC] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono font-medium text-[#D6D0C4] mb-1">
              Full Legal / Desk Trader Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0B0E14] border border-[#262C35] text-sm font-mono text-[#F2F0EA] focus:outline-none focus:border-[#D5B16D]"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#D6D0C4] mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@fund.com"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0B0E14] border border-[#262C35] text-sm font-mono text-[#F2F0EA] focus:outline-none focus:border-[#D5B16D]"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#D6D0C4] mb-1">
              Clearing Member / Trading Desk (Optional)
            </label>
            <input
              type="text"
              value={clearingMemberId}
              onChange={(e) => setClearingMemberId(e.target.value)}
              placeholder="e.g. MCX Member #48210"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0B0E14] border border-[#262C35] text-sm font-mono text-[#F2F0EA] focus:outline-none focus:border-[#D5B16D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-[#D6D0C4] mb-1">
                Passcode (Min 8 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0B0E14] border border-[#262C35] text-sm font-mono text-[#F2F0EA] focus:outline-none focus:border-[#D5B16D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#757D8A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#D6D0C4] mb-1">
                Confirm Passcode
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0B0E14] border border-[#262C35] text-sm font-mono text-[#F2F0EA] focus:outline-none focus:border-[#D5B16D]"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 text-xs font-mono text-[#9CA3AF] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded bg-[#0B0E14] border-[#262C35] text-[#D5B16D] focus:ring-[#D5B16D]"
              />
              <span>I acknowledge that cross-contract commodity relative-value involves physical basis, margin obligations, and execution frictions.</span>
            </label>
            {fieldErrors.terms && (
              <p className="mt-1 text-xs text-[#E47777] font-mono">{fieldErrors.terms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !supabaseActive}
            className="w-full py-2.5 px-4 mt-2 rounded-lg bg-[#D5B16D] hover:bg-[#E5C17D] text-[#0B0E14] font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering Trader...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span>Complete Registration</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-mono text-[#858D97]">
          <span>Already registered? </span>
          <Link href="/login" className="text-[#D5B16D] hover:underline font-semibold">
            Sign In with Desk Credentials
          </Link>
        </div>
      </div>
    </div>
  );
}
