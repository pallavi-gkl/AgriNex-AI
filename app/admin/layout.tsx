import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNavTabs from "@/components/admin/AdminNavTabs";
import PageBackground from "@/components/ui/PageBackground";

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
    <div className="min-h-screen ag-page-bg relative font-sans">
      <PageBackground variant="admin" />
      <div className="relative z-10 flex flex-col p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Admin Header */}
      <div className="premium-card p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] leading-none">
          AgriNex <span className="gradient-text-purple">Admin Console</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Platform Operations & Quality Escrow Dashboard
        </p>
      </div>

      {/* Tabs Pill strip */}
      <AdminNavTabs />

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}