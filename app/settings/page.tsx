"use client";

/**
 * @fileoverview app/settings/page.tsx — Role-based redirect to correct settings page.
 * Farmers are redirected to /farmer/settings
 * Consumers are redirected to /consumer/settings
 * Both pages inherit their respective role-based shell layouts automatically.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signin");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle() as { data: { role: string } | null; error: any };

      if (profile?.role === "farmer") {
        router.replace("/farmer/settings");
      } else if (profile?.role === "consumer") {
        router.replace("/consumer/settings");
      } else {
        router.replace("/onboarding");
      }
    };
    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ background: "#030704" }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold">Loading preferences...</p>
      </div>
    </div>
  );
}
