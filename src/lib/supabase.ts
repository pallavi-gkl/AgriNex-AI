/**
 * @fileoverview Supabase browser client for AgriNex AI.
 * Uses @supabase/ssr for Next.js App Router compatibility.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (process.env.NODE_ENV === "development") {
  if (!supabaseUrl) console.warn("[AgriNex] NEXT_PUBLIC_SUPABASE_URL is not set.");
  if (!supabaseAnonKey) console.warn("[AgriNex] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
}

/**
 * Singleton Supabase client for use in Client Components.
 * Environment variables must be set in .env.local.
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
