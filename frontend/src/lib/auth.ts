/**
 * SWARNANET: Production Authentication Module
 * Integrated with Supabase Auth for institutional trader identity & audit logging.
 * Gracefully falls back to Local Analytical Mode if Supabase environment variables are unset.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  companyName?: string;
  gstin?: string;
  traderId?: string;
}

export const GUEST_ANALYTICAL_USER: User = {
  id: "usr_guest_analyst",
  name: "Institutional Auditor",
  email: "auditor@swarnanet.local",
  role: "Quantitative Strategy Auditor",
  companyName: "SwarnaNet Analytics Desk",
  traderId: "AUDIT-MCX-01",
};

const USER_STORAGE_KEY = "swarnanet_auth_user";
const REMEMBER_ME_KEY = "swarnanet_remember_me";
const SAVED_EMAIL_KEY = "swarnanet_saved_email";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return getStoredUser() !== null;
}

/**
 * Real Supabase Sign-In
 */
export async function signInWithSupabase(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      error: "Supabase authentication is not configured. Please supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, or explore in Analytical Audit Mode.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "No user profile returned from Supabase" };
    }

    const appUser: User = {
      id: data.user.id,
      name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Trader",
      email: data.user.email || "",
      role: data.user.user_metadata?.role || "Quantitative Trader",
      companyName: data.user.user_metadata?.company_name || "MCX Institutional Desk",
      traderId: data.user.user_metadata?.trader_id || `TRD-${data.user.id.slice(0, 6).toUpperCase()}`,
    };

    setStoredUser(appUser);
    return { user: appUser, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication failed";
    return { user: null, error: msg };
  }
}

/**
 * Real Supabase Sign-Up
 */
export async function signUpWithSupabase(email: string, password: string, fullName: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase authentication is not configured. Please supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    };
  }

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "Quantitative Analyst",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sign up failed";
    return { success: false, error: msg };
  }
}

/**
 * Real Supabase Sign-Out
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  clearStoredUser();
}

/**
 * Guest Analytical Exploration Mode (When Supabase is not yet configured locally)
 */
export function enterGuestAnalyticalMode(): User {
  setStoredUser(GUEST_ANALYTICAL_USER);
  return GUEST_ANALYTICAL_USER;
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === "true";
  } catch {
    return false;
  }
}

export function setRememberMe(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMEMBER_ME_KEY, value ? "true" : "false");
  } catch {
    // ignore
  }
}

export function getSavedEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(SAVED_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function setSavedEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    if (email) {
      localStorage.setItem(SAVED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }
  } catch {
    // ignore
  }
}
