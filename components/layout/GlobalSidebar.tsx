"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  BarChart2,
  Brain,
  TrendingUp,
  Droplets,
  Map,
  FileText,
  Settings,
  LogOut,
  Leaf,
  Award,
  Calendar,
  Package,
  Heart,
  Star,
  X,
  CloudSun,
  Store,
  Sprout,
  Bot,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrentLanguage } from "./LanguageSwitcher";

/* ─── Section title translations ──────────────────────────────────────────────── */
const SECTION_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    navMain: "Main",
    navCrops: "Farm & Crops",
    navMarket: "Marketplace",
    navAI: "AI Features",
    navInsights: "Analytics",
    navResources: "Resources",
    navSystem: "System",
    navCommerce: "Shopping",
    navAccount: "Account",
  },
  hi: {
    navMain: "मुख्य",
    navCrops: "खेत और फसल",
    navMarket: "बाज़ार",
    navAI: "एआई फीचर्स",
    navInsights: "एनालिटिक्स",
    navResources: "संसाधन",
    navSystem: "सेटिंग्स",
    navCommerce: "खरीदारी",
    navAccount: "खाता",
  },
  te: {
    navMain: "ప్రధాన",
    navCrops: "వ్యవసాయం & పంటలు",
    navMarket: "మార్కెట్",
    navAI: "AI ఫీచర్లు",
    navInsights: "విశ్లేషణలు",
    navResources: "వనరులు",
    navSystem: "సెట్టింగులు",
    navCommerce: "షాపింగ్",
    navAccount: "అకౌంట్",
  },
  ta: {
    navMain: "முக்கியம்",
    navCrops: "பண்ணை & பயிர்கள்",
    navMarket: "சந்தை",
    navAI: "AI அம்சங்கள்",
    navInsights: "பகுப்பாய்வு",
    navResources: "வளங்கள்",
    navSystem: "அமைப்புகள்",
    navCommerce: "ஷாப்பிங்",
    navAccount: "கணக்கு",
  },
  kn: {
    navMain: "ಮುಖ್ಯ",
    navCrops: "ಕೃಷಿ ಮತ್ತು ಬೆಳೆಗಳು",
    navMarket: "ಮಾರುಕಟ್ಟೆ",
    navAI: "AI ವೈಶಿಷ್ಟ್ಯಗಳು",
    navInsights: "ವಿಶ್ಲೇಷಣೆ",
    navResources: "ಸಂಪನ್ಮೂಲಗಳು",
    navSystem: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    navCommerce: "ಶಾಪಿಂಗ್",
    navAccount: "ಖಾತೆ",
  },
  ml: {
    navMain: "പ്രധാനം",
    navCrops: "കൃഷിയും വിളകളും",
    navMarket: "മാർക്കറ്റ്",
    navAI: "AI ഫീച്ചറുകൾ",
    navInsights: "വിശകലനം",
    navResources: "വിഭവങ്ങൾ",
    navSystem: "ക്രമീകരണങ്ങൾ",
    navCommerce: "ഷോപ്പിംഗ്",
    navAccount: "അക്കൗണ്ട്",
  },
};

interface NavLink {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  label?: string; // override label (for items without translation key)
}

interface NavSection {
  titleKey: string;
  links: NavLink[];
}

/* ─── Farmer Navigation ─────────────────────────────────────────────────────── */
const FARMER_SECTIONS: NavSection[] = [
  {
    titleKey: "navMain",
    links: [
      { href: "/farmer/dashboard", labelKey: "farmerDashboard", icon: LayoutDashboard },
    ],
  },
  {
    titleKey: "navCrops",
    links: [
      { href: "/farmer/inventory", labelKey: "cropsInventory", icon: Package },
      { href: "/farmer/irrigation", labelKey: "irrigation", icon: Droplets },
      { href: "/farmer/calendar", labelKey: "farmCalendar", icon: Calendar },
      { href: "/farmer/farm-twin", labelKey: "digitalTwin", icon: Layers },
    ],
  },
  {
    titleKey: "navMarket",
    links: [
      { href: "/farmer/market", labelKey: "marketPrices", icon: TrendingUp },
      { href: "/farmer/orders", labelKey: "farmerOrders", icon: ClipboardList },
    ],
  },
  {
    titleKey: "navAI",
    links: [
      { href: "/farmer/ai-lab", labelKey: "aiLab", icon: Brain },
      { href: "/farmer/ai-assistant", labelKey: "aiAssistantFarmer", icon: Bot },
      { href: "/farmer/weather", labelKey: "weather", icon: CloudSun },
    ],
  },
  {
    titleKey: "navInsights",
    links: [
      { href: "/farmer/analytics", labelKey: "analyticsTitle", icon: BarChart2 },
      { href: "/farmer/reports", labelKey: "reports", icon: FileText },
    ],
  },
  {
    titleKey: "navResources",
    links: [
      { href: "/farmer/schemes", labelKey: "govSchemes", icon: Award },
      { href: "/farmer/maps", labelKey: "logisticsMap", icon: Map },
    ],
  },
  {
    titleKey: "navSystem",
    links: [
      { href: "/farmer/settings", labelKey: "settings", icon: Settings },
    ],
  },
];

/* ─── Consumer Navigation ───────────────────────────────────────────────────── */
const CONSUMER_SECTIONS: NavSection[] = [
  {
    titleKey: "navMain",
    links: [
      { href: "/consumer/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    ],
  },
  {
    titleKey: "navMarket",
    links: [
      { href: "/consumer/marketplace", labelKey: "marketplace", icon: Store },
    ],
  },
  {
    titleKey: "navCommerce",
    links: [
      { href: "/consumer/orders", labelKey: "myOrders", icon: ClipboardList },
      { href: "/consumer/wishlist", labelKey: "wishlist", icon: Heart },
      { href: "/consumer/compare", labelKey: "compare", icon: BarChart2 },
    ],
  },
  {
    titleKey: "navAccount",
    links: [
      { href: "/consumer/reviews", labelKey: "myReviews", icon: Star },
      { href: "/consumer/settings", labelKey: "settings", icon: Settings },
    ],
  },
];

/* ─── Sign out translations ─────────────────────────────────────────────────── */
const SIGNOUT_LABELS: Record<string, string> = {
  en: "Sign Out",
  hi: "लॉग आउट",
  te: "లాగ్ అవుట్",
  ta: "வெளியேறு",
  kn: "ಸೈನ್ ಔಟ್",
  ml: "സൈൻ ഔട്ട്",
};

/* ─── Props ─────────────────────────────────────────────────────────────────── */
interface GlobalSidebarProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSidebar({ profile, isOpen, onClose }: GlobalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isFarmer = profile?.role === "farmer";
  const activePlatform = isFarmer ? "farmer" : "consumer";

  const { t } = useTranslation(activePlatform);
  const [currentCode, setCurrentCode] = useState("en");

  const sections = isFarmer ? FARMER_SECTIONS : CONSUMER_SECTIONS;

  /* Sync language */
  useEffect(() => {
    setCurrentCode(getCurrentLanguage(activePlatform));
    const handleLangChange = (e: Event) => {
      const ev = e as CustomEvent<{ code: string; platform?: string }>;
      const { code, platform } = ev.detail ?? {};
      if (code && (!platform || platform === "all" || platform === activePlatform)) {
        setCurrentCode(code);
      }
    };
    window.addEventListener("agrinex:language-change", handleLangChange);
    return () => window.removeEventListener("agrinex:language-change", handleLangChange);
  }, [activePlatform]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const getLabel = (link: NavLink) =>
    link.label || t(link.labelKey) || link.labelKey;

  /* ── Sidebar Content ─────────────────────────────────────────────────────── */
  const SidebarContent = () => (
    <div
      className="flex flex-col h-full overflow-x-hidden"
      style={{
        background: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
      }}
    >
      {/* Brand (desktop only — hidden because topbar shows logo) */}
      <div
        className="px-5 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid #F1F5F9" }}
      >
        <Link href="/" className="flex items-center gap-3 group no-underline">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0"
            style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none min-w-0">
            <span className="font-extrabold text-slate-800 text-sm block tracking-tight dark:text-slate-100">
              AgriNex AI
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold tracking-wide">
              {isFarmer ? "Farmer Platform" : "Consumer Platform"}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
        <div className="space-y-5">
          {sections.map((section) => {
            const sectionTitle =
              SECTION_TRANSLATIONS[currentCode]?.[section.titleKey] ||
              SECTION_TRANSLATIONS["en"]?.[section.titleKey] ||
              section.titleKey;

            return (
              <div key={section.titleKey}>
                {/* Section header */}
                <p
                  className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest select-none"
                  style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}
                >
                  {sectionTitle}
                </p>

                {/* Links */}
                <div className="space-y-0.5">
                  {section.links.map((link) => {
                    const LinkIcon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 no-underline group"
                        style={
                          active
                            ? {
                                background: "#DCFCE7",
                                color: "#16A34A",
                                fontWeight: 600,
                              }
                            : {
                                color: "#374151",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = "#F0FDF4";
                            (e.currentTarget as HTMLElement).style.color = "#15803D";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = "";
                            (e.currentTarget as HTMLElement).style.color = "#374151";
                          }
                        }}
                      >
                        <LinkIcon
                          className="shrink-0 transition-colors"
                          style={{
                            width: "16px",
                            height: "16px",
                            color: active ? "#22C55E" : "#9CA3AF",
                          }}
                        />
                        <span className="flex-1 truncate">{getLabel(link)}</span>
                        {active && (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "#22C55E" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer: Sign Out */}
      <div
        className="px-3 py-4 shrink-0"
        style={{ borderTop: "1px solid #F1F5F9" }}
      >
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer border-0 bg-transparent group dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/20"
        >
          <LogOut
            className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors shrink-0"
            style={{ width: "16px", height: "16px" }}
          />
          <span>{SIGNOUT_LABELS[currentCode] || "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col h-full overflow-hidden shrink-0"
        style={{ width: "280px", minWidth: "280px", maxWidth: "280px" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 z-50 lg:hidden shadow-2xl"
              style={{ width: "280px" }}
            >
              {/* Close button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white text-slate-500 hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}