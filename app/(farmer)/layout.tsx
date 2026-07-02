/**
 * @fileoverview Farmer route-group layout — enforces the farmer role.
 * Non-farmer users are redirected to their appropriate dashboard.
 * Users without a profile are redirected to the onboarding/role selection page.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DemoProvider } from "@/context/DemoContext";
import FarmerShell from "@/components/farmer/shell/FarmerShell";

export default async function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* read-only in some contexts */ }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

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

  if (profile.role !== "farmer") {
    if (profile.role === "consumer") {
      redirect("/consumer/marketplace");
    } else if (profile.role === "admin") {
      redirect("/admin");
    }
  }

  return (
    <DemoProvider>
      <FarmerShell profile={profile}>{children}</FarmerShell>
    </DemoProvider>
  );
}
