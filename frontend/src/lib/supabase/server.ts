import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { isSupabaseConfigured } from "./client";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!isSupabaseConfigured()) {
    return null;
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}
