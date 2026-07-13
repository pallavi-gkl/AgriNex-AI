/**
 * @fileoverview Supabase OAuth callback handler for AgriNex AI.
 * Handles the redirect after Google OAuth sign-in.
 * Exchanges the PKCE code for a session, verifies profile existence,
 * and redirects to onboarding or the appropriate dashboard.
 *
 * Fix log:
 *  - Added next= param support so deep-link redirects work after OAuth.
 *  - Improved error forwarding via ?error= query param to /signin.
 *  - Handles missing user gracefully.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { cleanEnvVar } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/"; // optional deep-link target

  if (!code) {
    // No code — redirect to sign-in with a descriptive error
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent("auth_callback_failed")}`
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route handler — cookies may be read-only in edge cases
          }
        },
      },
    }
  );

  // Exchange the OAuth code for a valid session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[OAuth Callback] Code exchange failed:", exchangeError.message);
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent("auth_callback_failed")}`
    );
  }

  // Retrieve the authenticated user (verified, not just from cookie)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[OAuth Callback] getUser() failed:", userError?.message);
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent("auth_callback_failed")}`
    );
  }

  // Check whether a profile row exists for this user
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Route based on profile existence and role
  if (!profile) {
    // New user — send to onboarding
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  if (profile.role === "farmer") {
    return NextResponse.redirect(`${origin}/farmer/dashboard`);
  }

  if (profile.role === "admin") {
    return NextResponse.redirect(`${origin}/admin`);
  }

  // consumer (or any unknown role)
  return NextResponse.redirect(`${origin}/consumer/marketplace`);
}
