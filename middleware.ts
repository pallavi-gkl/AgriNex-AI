/**
 * @fileoverview Next.js middleware for AgriNex AI.
 * Refreshes Supabase auth sessions on every request to prevent token expiry.
 * This is the recommended pattern for @supabase/ssr with Next.js App Router.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this keeps the user logged in
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 1. Guard protected paths
  if (
    path.startsWith("/farmer") ||
    path.startsWith("/consumer") ||
    path.startsWith("/admin") ||
    path.startsWith("/onboarding")
  ) {
    if (!user) {
      url.pathname = "/signin";
      // Preserving any query string
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url);
    }
  }

  // 2. Redirect authenticated users away from the root landing page only.
  //    /signin and /signup are intentionally NOT included here — the signin
  //    page reads the profile table and routes correctly itself. Including
  //    them here would cause a race where stale user_metadata redirects to
  //    the wrong dashboard before the profile fetch completes.
  if (user && path === "/") {
    // Query profiles to get the correct up-to-date role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role;
    if (role === "farmer") {
      url.pathname = "/farmer/dashboard";
      return NextResponse.redirect(url);
    } else if (role === "consumer") {
      url.pathname = "/consumer/marketplace";
      return NextResponse.redirect(url);
    } else if (role === "admin") {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    } else {
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, sitemap.xml, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
