"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ConsumerSidebar from "./ConsumerSidebar";
import ConsumerTopbar from "./ConsumerTopbar";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import VoiceAssistantModal from "@/components/layout/VoiceAssistantModal";
import { CartProvider } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";

interface ConsumerShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function ConsumerShell({
  children,
  profile: initialProfile,
}: ConsumerShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch profile client-side if not provided
  useEffect(() => {
    if (!profile) {
      const getProfile = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (data) setProfile(data);
        }
      };
      getProfile();
    }
  }, [profile]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const { t } = useTranslation();

  const getPageTitle = () => {
    if (pathname.includes("/marketplace")) return t("freshProduceMarketplace");
    if (pathname.includes("/orders")) return t("myOrders");
    if (pathname.includes("/wishlist")) return t("wishlist");
    if (pathname.includes("/notifications")) return t("notifications");
    if (pathname.includes("/dashboard")) return t("dashboard");
    if (pathname.includes("/reviews")) return t("myReviews");
    if (pathname.includes("/compare")) return t("compare");
    if (pathname.includes("/settings")) return t("settings");
    return "Consumer Portal";
  };

  return (
    <div
      className="min-h-screen theme-consumer-light text-black bg-white"
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-40">
        <ConsumerSidebar profile={profile} unreadCount={unreadCount} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 lg:hidden"
              style={{ backdropFilter: "blur(4px)" }}
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 lg:hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ConsumerSidebar profile={profile} unreadCount={unreadCount} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <ConsumerTopbar
        title={getPageTitle()}
        profile={profile}
        unreadCount={unreadCount}
        onMenuClick={() => setMobileMenuOpen(true)}
        onNotifClick={() => setNotifOpen(true)}
      />

      {/* Main Content */}
      <main className="lg:pl-[280px] pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <CartProvider>
            {children}
          </CartProvider>
        </div>
      </main>

      {/* Notifications Drawer */}
      <NotificationsPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <VoiceAssistantModal />
    </div>
  );
}
