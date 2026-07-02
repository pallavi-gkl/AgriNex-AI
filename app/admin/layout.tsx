import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNavTabs from "@/components/admin/AdminNavTabs";

export default async function AdminLayout({
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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only in some Server Component environments
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "admin") {
    redirect("/consumer/marketplace");
  }

  return (
    <div className="min-h-screen flex flex-col p-6 space-y-6">
      {/* Admin Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text-purple leading-none">
          Admin Console
        </h1>
        <p className="text-slate-500 text-xs mt-0.5 font-mono">
          Platform Operations & Quality Escrow Dashboard
        </p>
      </div>

      {/* Tabs Pill strip */}
      <AdminNavTabs />

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
