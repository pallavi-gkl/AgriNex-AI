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
    <div className="premium-card flex flex-wrap gap-1 p-1.5 max-w-3xl">
      {ADMIN_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all no-underline ${
              isActive
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)] font-bold"
                : "text-slate-600 hover:text-purple-700 hover:bg-purple-50"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}