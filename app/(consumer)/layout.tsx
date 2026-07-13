/**
 * @fileoverview Consumer route-group layout — enforces the consumer role.
 * Wraps all /consumer/* pages in the ConsumerShell (sidebar + topbar + notifications).
 * Non-consumer users are redirected to their appropriate dashboard.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ConsumerShell from "@/components/consumer/shell/ConsumerShell";
import { cleanEnvVar } from "@/lib/env";

export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            // Server Component — cookies may be read-only
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "consumer") {
    if (profile.role === "farmer") {
      redirect("/farmer/dashboard");
    } else if (profile.role === "admin") {
      redirect("/admin");
    }
    redirect("/onboarding");
  }

  return <ConsumerShell profile={profile}>{children}</ConsumerShell>;
}
