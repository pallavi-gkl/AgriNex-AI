/**
 * @fileoverview Supabase browser client for AgriNex AI.
 * Uses @supabase/ssr for Next.js App Router compatibility.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Proactive security check: ensure browser does not initialize client with service_role key
if (supabaseAnonKey) {
  try {
    const parts = supabaseAnonKey.split(".");
    if (parts.length === 3) {
      const payloadStr =
        typeof window !== "undefined"
          ? atob(parts[1])
          : Buffer.from(parts[1], "base64").toString("binary");
      const payload = JSON.parse(payloadStr);
      if (payload.role === "service_role") {
        console.error(
          "CRITICAL SECURITY WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY is configured with the service_role key! Disabling client-side access to protect secrets."
        );
        supabaseAnonKey = "";
      }
    }
  } catch (e) {}
}

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
  supabaseAnonKey ?? "",
  {
    global: {
      fetch: (url, options) => {
        if (options?.headers) {
          const headers = new Headers(options.headers);
          const auth = headers.get("Authorization");
          if (auth) {
            headers.set("Authorization", auth.replace(/[\r\n]/g, ""));
          }
          options.headers = headers;
        }
        return fetch(url, options);
      },
    },
  }
);
