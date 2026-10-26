import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder")
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a dummy client or null if not configured to prevent crashes during local mode
    return createSupabaseClient<Database>(
      "https://unconfigured.supabase.co",
      "unconfigured-anon-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
