/**
 * @fileoverview POST /api/auth/signup
 *
 * Server-side signup handler that uses the Supabase admin client to create users.
 * This ensures identities are properly created (fixes "Invalid login credentials" bug).
 *
 * Flow:
 * 1. Receive email, password, full_name, phone_number, role
 * 2. Use admin.createUser() with email_confirm: true (bypasses email confirmation)
 * 3. This correctly creates the auth.users record AND the identity record
 * 4. Insert profile into public.profiles (in case trigger hasn't fired)
 * 5. Return the created user's ID for the client to proceed
 *
 * Security:
 * - SUPABASE_SERVICE_ROLE_KEY is server-only (no NEXT_PUBLIC_ prefix)
 * - Password is handled entirely by Supabase, never stored or logged
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone_number, role } = body as {
      email?: string;
      password?: string;
      full_name?: string;
      phone_number?: string;
      role?: "farmer" | "consumer";
    };

    // --- Input Validation ---
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!["farmer", "consumer"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be farmer or consumer" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("[signup] Missing Supabase env vars");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Admin client — uses service-role key, can create users properly
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- Create User via Admin API ---
    // Using admin.createUser ensures:
    // 1. The auth.users record is created
    // 2. The identity record is created (critical for password login!)
    // 3. Email is immediately confirmed (no email verification step)
    const { data: newUserData, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Enforce email confirmation verification step
        user_metadata: {
          full_name:    full_name    ?? "Unknown",
          phone_number: phone_number ?? "0000000000",
          role,
        },
      });

    if (createError) {
      console.error("[signup] admin.createUser error:", {
        code:    createError.code,
        message: createError.message,
        status:  (createError as any).status,
      });

      // Return user-friendly error messages — catch all Supabase duplicate variants
      const msg = createError.message.toLowerCase();
      const isDuplicate =
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("already exists") ||
        msg.includes("duplicate") ||
        msg.includes("user already") ||
        (createError as any).status === 422 ||
        (createError as any).code === "23505";

      if (isDuplicate) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    const user = newUserData.user;
    if (!user) {
      return NextResponse.json(
        { error: "User creation failed — no user returned" },
        { status: 500 }
      );
    }

    // --- Ensure Profile Exists ---
    // The on_auth_user_created trigger should handle this, but we do it
    // explicitly as a safety net in case the trigger fails.
    const { error: profileError } = await admin
      .from("profiles")
      .upsert(
        {
          id:           user.id,
          full_name:    full_name    ?? "Unknown",
          phone_number: phone_number ?? "0000000000",
          role,
        },
        { onConflict: "id", ignoreDuplicates: false }
      );

    if (profileError) {
      console.error("[signup] Profile upsert error:", profileError.message);
      // Non-fatal: user was created successfully, profile can be created later
    }

    console.log(`[signup] User created: ${email} (${role}) ID: ${user.id}`);

    // Trigger sending the Supabase email verification confirmation email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error: resendError } = await admin.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (resendError) {
      console.error("[signup] Trigger verification resend failed:", resendError.message);
    }

    return NextResponse.json({
      success: true,
      userId:  user.id,
      email:   user.email,
      role,
    });
  } catch (err: any) {
    console.error("[signup] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
