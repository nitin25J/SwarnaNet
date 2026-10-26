"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MailCheck,
  KeyRound,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const supabaseActive = isSupabaseConfigured();

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Institutional email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid institutional address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    if (!supabaseActive) {
      setErrorMessage("Supabase is not configured locally. Please supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to send reset emails.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to issue recovery token. Please contact exchange desk admin.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[450px] mx-auto">
      <div className="relative rounded-2xl border border-white/10 bg-[#12161E]/90 backdrop-blur-xl p-7 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#1C1F22] border border-[#34383D] text-[#D5B16D] mb-2">
            <KeyRound className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#F2F0EA]">
            Reset Desk Passcode
          </h2>
          <p className="text-xs text-[#9299A3] mt-1 font-mono">
            Enter your institutional email to dispatch a cryptographic reset token
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-[#301C1E] border border-[#704044] text-xs font-mono text-[#E47777] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#18231C] border border-[#2E5E3E] text-[#86EFAC]">
              <MailCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-[#F2F0EA]">
                Security Dispatch Complete
              </h3>
              <p className="text-xs text-[#9299A3] font-mono mt-1">
                A password reset authorization link has been sent to <span className="text-[#F2F0EA]">{email}</span>.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-[#181C24] hover:bg-[#222834] text-[#E5E7EB] font-mono text-xs border border-[#2E3644] transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {emailError && (
                <p className="mt-1 text-xs text-[#E47777] font-mono">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#D5B16D] hover:bg-[#E5C17D] text-[#0B0E14] font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching Token...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Dispatch Reset Token</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs font-mono">
              <Link href="/login" className="text-[#9CA3AF] hover:text-[#F2F0EA] inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
