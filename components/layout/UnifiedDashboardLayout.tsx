"use client";
/**
 * @fileoverview UnifiedDashboardLayout
 * Shared shell for Farmer and Consumer platforms.
 *
 * Layout (desktop) — identical to ChatGPT / Cursor / Vercel:
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  Root: fixed inset-0 flex (no page-level scroll)            │
 *  │  ┌───────────────────┐  ┌──────────────────────────────────┐│
 *  │  │ Sidebar           │  │ Content Column                   ││
 *  │  │ w-[17vw]          │  │ flex-1  flex-col  overflow-hidden││
 *  │  │ h-full            │  │  ┌────────────────────────────┐  ││
 *  │  │ overflow-y-auto   │  │  │ Topbar (shrink-0)          │  ││
 *  │  │ (scrolls alone)   │  │  └────────────────────────────┘  ││
 *  │  │                   │  │  ┌────────────────────────────┐  ││
 *  │  │                   │  │  │ <main> flex-1 overflow-y   │  ││
 *  │  │                   │  │  │  (scrolls alone)           │  ││
 *  │  │                   │  │  └────────────────────────────┘  ││
 *  │  └───────────────────┘  └──────────────────────────────────┘│
 *  └──────────────────────────────────────────────────────────────┘
 *
 * The AI panel slides in from the right as a fixed overlay.
 * The floating AI button stays fixed at bottom-right.
 * Mobile: sidebar becomes a drawer overlay.
 */

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import GlobalSidebar from "./GlobalSidebar";
import GlobalTopbar from "./GlobalTopbar";
import AIAssistantDrawer from "./AIAssistantDrawer";
import PageBackground from "@/components/ui/PageBackground";
import type { Profile } from "@/types";
import LocationHeader from "@/components/shared/LocationHeader";

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function UnifiedDashboardLayout({ children, profile }: UnifiedDashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Don't show sidebar/topbar on landing page or auth pages
  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");
  const isLandingPage = pathname === "/";
  const shouldShowLayout = !isAuthPage && !isLandingPage;

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  const platform = profile?.role === "farmer" ? "farmer" : "consumer";

  return (
    <>
      {/* ── Root shell: fills exactly the browser viewport, no body scroll ── */}
      <div
        className={[
          "ag-dashboard-shell ag-page-bg theme-dashboard text-slate-900 font-sans",
          aiPanelOpen ? "ai-panel-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PageBackground variant="dashboard" />

        {/* ── LEFT: Sidebar — rendered exactly once, handles its own desktop vs mobile visibility internally ── */}
        <GlobalSidebar
          profile={profile}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />


        {/* ── RIGHT: Content column — topbar + scrollable main ── */}
        <div
          className={[
            "ag-content-column flex flex-col flex-1 min-w-0 overflow-hidden",
            aiPanelOpen ? "ag-content-ai-open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Topbar — sticks to top of content column, never scrolls away */}
          <div className="ag-topbar-wrapper shrink-0">
            <GlobalTopbar
              profile={profile}
              onMenuClick={() => setMobileMenuOpen(true)}
              isMobileMenuOpen={mobileMenuOpen}
            />
          </div>

          {/* Main content — the ONLY scrollable area in the content column */}
          <main className="ag-main-scroll flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-[1600px] w-full mx-auto relative z-10">
              <LocationHeader platform={platform} />
              {children}
            </div>
          </main>
        </div>

        {/* AI Assistant Sliding Panel (fixed overlay) */}
        <AIAssistantDrawer
          isOpen={aiPanelOpen}
          onClose={() => setAiPanelOpen(false)}
          profile={profile}
        />

        {/* Floating Blue AI Button — fixed, always visible */}
        <button
          onClick={() => setAiPanelOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-0 cursor-pointer"
          style={{
            background: aiPanelOpen
              ? "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)"
              : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            boxShadow: "0 10px 25px rgba(37, 99, 235, 0.45)",
          }}
          title={aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
          aria-label={aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
          aria-expanded={aiPanelOpen}
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      </div>
    </>
  );
}