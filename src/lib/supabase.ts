/**
 * @fileoverview Supabase browser client for AgriNex AI.
 * Uses @supabase/ssr for Next.js App Router compatibility.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Singleton Supabase client for use in Client Components.
 * Environment variables must be set in .env.local.
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
