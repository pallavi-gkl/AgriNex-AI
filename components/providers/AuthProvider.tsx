"use client";

/**
 * @fileoverview AuthProvider — Client-side authentication context.
 * Handles getSession() on app load, sets up the onAuthStateChange listener,
 * and exposes the current session, user, and loading state.
 *
 * Fix log:
 *  - SIGNED_OUT no longer pushes to /signin from auth-group pages (prevents
 *    OAuth mid-flow redirect conflict).
 *  - Added TOKEN_REFRESHED handling to keep session fresh.
 *  - Stabilised initial load vs listener race with a mounted guard.
 */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

// Pages inside the (auth) route-group — no session required
const AUTH_ROUTES = ["/signin", "/signup", "/onboarding"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const initialised = useRef(false);

  useEffect(() => {
    // 1. Restore session on mount (handles page refreshes)
    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (!initialised.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (err) {
        console.error("[AuthProvider] Error restoring session:", err);
      } finally {
        setLoading(false);
        initialised.current = true;
      }
    };

    initAuth();

    // 2. Listen for auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      initialised.current = true;

      if (event === "SIGNED_IN") {
        // Refresh server components so layout picks up the new session cookie
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        // Only redirect to /signin when NOT already on an auth page.
        // This prevents a mid-OAuth-flow sign-out event from interrupting
        // the code exchange that happens in /auth/callback.
        const isOnAuthPage = AUTH_ROUTES.some(
          (r) => pathname === r || pathname.startsWith(r + "?")
        );
        if (!isOnAuthPage) {
          router.refresh();
          router.push("/signin");
        }
      } else if (event === "TOKEN_REFRESHED") {
        // Session cookie was silently refreshed — re-sync server components
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
