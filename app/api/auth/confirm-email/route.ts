/**
 * @fileoverview POST /api/auth/confirm-email
 *
 * Instantly confirms a newly-created user's email address using the
 * Supabase admin client (service-role key).  This allows the user to
 * sign in immediately after registration without waiting for a
 * confirmation email.
 *
 * Security:
 *  - SUPABASE_SERVICE_ROLE_KEY is a server-only env var (no NEXT_PUBLIC_ prefix).
 *    It is never included in the browser bundle.
 *  - The route accepts a userId, verifies it is a non-empty UUID-shaped string,
 *    then calls auth.admin.updateUserById.  No sensitive data is returned.
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Minimal UUID shape check — not cryptographic, just guards against obviously
// bad input before we hit the Supabase API.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json(
        { error: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    const { cleanEnvVar } = await import("@/lib/env");
    const supabaseUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const serviceKey  = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!supabaseUrl || !serviceKey) {
      console.error("[confirm-email] Missing SUPABASE env vars");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Admin client — uses service-role key, bypasses RLS
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error("[confirm-email] Admin updateUserById error:", {
        code:    error.code,
        message: error.message,
        status:  (error as any).status,
      });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[confirm-email] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
