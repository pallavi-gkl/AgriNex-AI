"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileCheck, ShieldAlert, Users, Bell } from "lucide-react";

const ADMIN_TABS = [
  { id: "overview",   label: "Overview",      icon: BarChart3,   href: "/admin" },
  { id: "kyc",        label: "KYC Review",    icon: FileCheck,   href: "/admin/kyc" },
  { id: "disputes",   label: "Disputes",      icon: ShieldAlert, href: "/admin/disputes" },
  { id: "users",      label: "Users",         icon: Users,       href: "/admin/users" },
  { id: "notify",     label: "Notifications", icon: Bell,        href: "/admin/notify" },
];

export default function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-white/5 space-x-1 p-1 bg-white/[0.02] rounded-xl max-w-2xl">
      {ADMIN_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? "bg-purple-500/10 text-purple-300 border-b-2 border-purple-500 shadow-[0_4px_12px_rgba(139,92,246,0.15)] font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
