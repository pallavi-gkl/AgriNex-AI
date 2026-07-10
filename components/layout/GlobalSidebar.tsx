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
  CloudSun,
  TrendingUp,
  Droplets,
  Map,
  FileText,
  Bell,
  Settings,
  User,
  LogOut,
  Leaf,
  CheckCircle2,
  Clock,
  Star,
  ChevronDown,
  Award,
  Calendar,
  Package,
  Heart,
  Globe,
  Search,
  X,
  Cpu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { dispatchLanguageChange, getCurrentLanguage } from "./LanguageSwitcher";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { MapPin } from "lucide-react";

// Category translations mapping for multilingual title display
const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    Main: "Main",
    Marketplace: "Marketplace",
    "AI Features": "AI Features",
    Insights: "Insights",
    Resources: "Resources",
    Account: "Account",
    Language: "Language",
    Settings: "Settings",
  },
  hi: {
    Main: "मुख्य",
    Marketplace: "बाज़ार",
    "AI Features": "एआई विशेषताएं",
    Insights: "इनसाइट्स",
    Resources: "संसाधन",
    Account: "खाता",
    Language: "भाषा",
    Settings: "सेटिंग्स",
  },
  te: {
    Main: "ప్రధాన",
    Marketplace: "మార్కెట్ ప్లేస్",
    "AI Features": "AI ఫీచర్లు",
    Insights: "అవగాహనలు",
    Resources: "వనరులు",
    Account: "ఖాతా",
    Language: "భాഷ",
    Settings: "సెట్టింగులు",
  },
  ta: {
    Main: "முக்கிய",
    Marketplace: "சந்தை",
    "AI Features": "AI அம்சங்கள்",
    Insights: "நுண்ணறிவுகள்",
    Resources: "வளங்கள்",
    Account: "கணக்கு",
    Language: "மொழி",
    Settings: "அமைப்புகள்",
  },
  kn: {
    Main: "ಮುಖ್ಯ",
    Marketplace: "ಮಾರುಕಟ್ಟೆ",
    "AI Features": "AI ವೈಶಿಷ್ಟ್ಯಗಳು",
    Insights: "ಒಳನೋಟಗಳು",
    Resources: "ಸಂಪನ್ಮೂലಗಳು",
    Account: "ಖಾತೆ",
    Language: "ಭಾಷೆ",
    Settings: "ಸंಯೋಜನೆಗಳು",
  },
  ml: {
    Main: "പ്രധാനം",
    Marketplace: "മാർക്കറ്റ് പ്ലേസ്",
    "AI Features": "AI സവിശേഷതകൾ",
    Insights: "കാഴ്ചപ്പാടുകൾ",
    Resources: "വിഭവങ്ങൾ",
    Account: "അക്കൗണ്ട്",
    Language: "ഭാഷ",
    Settings: "ക്രമീകരണങ്ങൾ",
  }
};

const LANGUAGE_OPTIONS = [
  { code: "en", flag: "🇬🇧", nativeLabel: "English" },
  { code: "hi", flag: "🇮🇳", nativeLabel: "हिंदी" },
  { code: "te", flag: "🇮🇳", nativeLabel: "తెలుగు" },
  { code: "ta", flag: "🇮🇳", nativeLabel: "தமிழ்" },
  { code: "kn", flag: "🇮🇳", nativeLabel: "ಕನ್ನಡ" },
  { code: "ml", flag: "🇮🇳", nativeLabel: "മലയാളം" },
];

interface SubmenuItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
}

interface SidebarCategory {
  key: string;
  icon: React.ElementType;
  items?: SubmenuItem[];
  href?: string;
  isLanguage?: boolean;
}

const FARMER_CATEGORIES: SidebarCategory[] = [
  {
    key: "Main",
    icon: LayoutDashboard,
    items: [
      { href: "/farmer/dashboard", labelKey: "farmerDashboard", icon: LayoutDashboard },
      { href: "/farmer/inventory", labelKey: "cropsInventory", icon: Package },
    ],
  },
  {
    key: "Marketplace",
    icon: ShoppingCart,
    items: [
      { href: "/farmer/market", labelKey: "marketPrices", icon: TrendingUp },
      { href: "/farmer/orders", labelKey: "farmerOrders", icon: ClipboardList },
    ],
  },
  {
    key: "AI Features",
    icon: Brain,
    items: [
      { href: "/farmer/ai-lab", labelKey: "aiLab", icon: Brain },
      { href: "/farmer/weather", labelKey: "weatherTitle", icon: CloudSun },
      { href: "/farmer/irrigation", labelKey: "irrigation", icon: Droplets },
    ],
  },
  {
    key: "Insights",
    icon: BarChart2,
    items: [
      { href: "/farmer/analytics", labelKey: "analyticsTitle", icon: BarChart2 },
      { href: "/farmer/reports", labelKey: "reports", icon: FileText },
    ],
  },
  {
    key: "Resources",
    icon: Map,
    items: [
      { href: "/farmer/schemes", labelKey: "govSchemes", icon: Award },
      { href: "/farmer/calendar", labelKey: "farmCalendar", icon: Calendar },
      { href: "/farmer/maps", labelKey: "logisticsMap", icon: Map },
    ],
  },
  {
    key: "Account",
    icon: User,
    items: [
      { href: "/farmer/notifications", labelKey: "farmerNotifications", icon: Bell },
      { href: "/farmer/profile", labelKey: "profile", icon: User },
    ],
  },
  {
    key: "Language",
    icon: Globe,
    isLanguage: true,
  },
  {
    key: "Settings",
    icon: Settings,
    href: "/farmer/settings",
  },
];

const CONSUMER_CATEGORIES: SidebarCategory[] = [
  {
    key: "Main",
    icon: LayoutDashboard,
    items: [
      { href: "/consumer/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/consumer/marketplace", labelKey: "marketplace", icon: ShoppingCart },
    ],
  },
  {
    key: "Marketplace",
    icon: ShoppingCart,
    items: [
      { href: "/consumer/orders", labelKey: "myOrders", icon: ClipboardList },
      { href: "/consumer/wishlist", labelKey: "wishlist", icon: Heart },
      { href: "/consumer/compare", labelKey: "compare", icon: BarChart2 },
    ],
  },

  {
    key: "Account",
    icon: User,
    items: [
      { href: "/consumer/reviews", labelKey: "myReviews", icon: Star },
      { href: "/consumer/notifications", labelKey: "notifications", icon: Bell },
    ],
  },
  {
    key: "Language",
    icon: Globe,
    isLanguage: true,
  },
  {
    key: "Settings",
    icon: Settings,
    href: "/consumer/settings",
  },
];

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
  const { location, weather } = useLocationWeather();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState("en");

  const rawCategories = isFarmer ? FARMER_CATEGORIES : CONSUMER_CATEGORIES;

  // Sync with global language switcher state
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

  // Auto-expand category containing active path on mount or route change
  useEffect(() => {
    const activeCat = rawCategories.find((cat) =>
      cat.items?.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    );
    if (activeCat) {
      setExpandedCategory(activeCat.key);
    }
  }, [pathname, isFarmer, rawCategories]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

  const handleLanguageChangeInternal = async (code: string) => {
    if (code === currentCode) return;
    dispatchLanguageChange(code, activePlatform);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await (supabase
          .from("profiles") as any)
          .update({ language_preference: code })
          .eq("id", user.id);
      }
    } catch (err) {
      console.warn("Could not save language preference to profiles:", err);
    }
  };

  const toggleCategory = (key: string) => {
    setExpandedCategory((prev) => (prev === key ? null : key));
  };

  const handleCategoryClick = (category: SidebarCategory) => {
    if (category.href) {
      router.push(category.href);
      onClose();
    } else {
      toggleCategory(category.key);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Filter categories and submenus based on search text
  const filteredCategories = rawCategories
    .map((cat) => {
      const categoryNameTranslated = CATEGORY_TRANSLATIONS[currentCode]?.[cat.key] || cat.key;
      const matchesCategoryName = categoryNameTranslated.toLowerCase().includes(searchQuery.toLowerCase());

      if (cat.items) {
        const filteredItems = cat.items.filter((item) => {
          const itemLabel = t(item.labelKey);
          return itemLabel.toLowerCase().includes(searchQuery.toLowerCase());
        });
        return {
          ...cat,
          items: filteredItems,
          matchesCategoryName,
        };
      }

      return {
        ...cat,
        matchesCategoryName,
      };
    })
    .filter((cat) => {
      if (cat.items) {
        return cat.items.length > 0 || cat.matchesCategoryName;
      }
      return searchQuery.trim() === "" || cat.matchesCategoryName;
    });

  const SidebarContent = () => (
    <div className="flex flex-col min-h-full ag-sidebar-root overflow-x-hidden bg-[#0F3D2E]">
      {/* Brand Header */}
      <div className="px-5 pt-5 pb-4 border-b border-emerald-500/10 shrink-0">
        <Link href="/" className="flex items-center gap-3 group no-underline">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #14532d 100%)",
              boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
            }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white text-lg leading-none block tracking-tight">
              {t("agrinex")}
            </span>
            <span className="text-[10px] text-emerald-400 block leading-none mt-1 font-mono tracking-wider uppercase font-bold">
              {t("aiPlatform")}
            </span>
          </div>
        </Link>
      </div>

      {/* ── Location Card ─────────────────────────────────────── */}
      <div
        className="mx-4 my-2 rounded-2xl px-4 py-3 shrink-0"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)",
          border: "1px solid rgba(16,185,129,0.22)",
          boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {/* City / Village */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-extrabold text-sm text-white truncate">
                {location?.city || "Select Location"}
              </span>
            </div>
            {/* Temperature + Weather */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-100 font-semibold">
              <span className="text-base leading-none select-none" aria-hidden>
                {weather?.condition_icon || "🌤"}
              </span>
              <span className="text-white font-bold">
                {weather?.temperature !== undefined ? `${weather.temperature}°C` : "--°C"}
              </span>
              <span className="text-emerald-500">|</span>
              <span className="truncate text-emerald-200">
                {weather?.condition || "--"}
              </span>
            </div>
          </div>
        </div>
        {/* Change Location Button */}
        <button
          onClick={() => router.push(`/change-location?from=${encodeURIComponent(pathname)}&platform=${activePlatform}`)}
          className="w-full mt-2.5 py-2 px-3 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            boxShadow: "0 4px 12px rgba(22, 197, 94, 0.2)",
          }}
        >
          <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
          {t("changeLocation")}
        </button>
      </div>

      {/* User Info Section */}
      {profile && (
        <div className="mx-4 my-4 bg-[#14532D]/40 border border-emerald-500/15 rounded-2xl px-4 py-3 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ background: "linear-gradient(135deg, #16A34A, #14532D)" }}
              >
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/20 shadow-sm">
                {profile.is_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-400" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-bold truncate leading-tight">{profile.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {profile.role}
                </span>
                {isFarmer && profile.trust_score && (
                  <span className="flex items-center gap-0.5 text-slate-300 text-xs">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {profile.trust_score.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Search Bar in Sidebar */}
      <div className="px-4 mb-4 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder={
              currentCode === "hi"
                ? "मेन्यू खोजें..."
                : currentCode === "te"
                ? "మెనూ వెతకండి..."
                : currentCode === "ta"
                ? "மெனு தேடுக..."
                : "Search menu..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl text-xs bg-[#14532D] text-white placeholder-[#D1FAE5]/50 border border-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D1FAE5]/60" />
        </div>
      </div>

      {/* Navigation Category Cards */}
      <nav className="flex-1 px-3 py-2 space-y-3">
        {filteredCategories.map((category) => {
          const categoryName = CATEGORY_TRANSLATIONS[currentCode]?.[category.key] || category.key;
          const isCategoryExpanded = searchQuery.trim() !== "" || expandedCategory === category.key;
          const Icon = category.icon;

          const isCategoryActive = category.items
            ? category.items.some((item) => isActive(item.href))
            : category.href
            ? isActive(category.href)
            : false;

          return (
            <div key={category.key} className="space-y-1">
              <button
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "ag-nav-card",
                  isCategoryExpanded && "expanded"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4.5 h-4.5 shrink-0 transition-transform duration-200",
                      isCategoryExpanded || isCategoryActive
                        ? "card-icon-active"
                        : "card-icon-inactive"
                    )}
                  />
                  <span className="card-label truncate">{categoryName}</span>
                </div>
                {!category.href && (
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-white transition-transform duration-200",
                      isCategoryExpanded ? "rotate-180" : ""
                    )}
                  />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isCategoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ag-submenu-container pl-4 pr-1 py-1 border-l border-emerald-500/25 ml-5 mt-1">
                      {category.isLanguage ? (
                        LANGUAGE_OPTIONS.map((lang) => {
                          const isSelected = lang.code === currentCode;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChangeInternal(lang.code)}
                              className={cn(
                                "ag-submenu-item border border-transparent w-full cursor-pointer",
                                isSelected && "active"
                              )}
                            >
                              <span className="text-sm leading-none">{lang.flag}</span>
                              <span className="flex-1 text-left">{lang.nativeLabel}</span>
                            </button>
                          );
                        })
                      ) : (
                        category.items?.map((item) => {
                          const SubIcon = item.icon;
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => onClose()}
                              className={cn(
                                "ag-submenu-item border border-transparent no-underline",
                                active && "active"
                              )}
                            >
                              <SubIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="flex-1 truncate">{t(item.labelKey)}</span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="pt-3 pb-6 border-t border-emerald-500/10 flex flex-col gap-2 px-3 shrink-0">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#D1FAE5] hover:text-white hover:bg-red-500/20 hover:border-red-500/20 border border-transparent transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 text-[#D1FAE5] group-hover:text-white transition-colors animate-none" />
          <span>
            {currentCode === "hi"
              ? "लॉग आउट"
              : currentCode === "te"
              ? "లాగ్ అవుట్"
              : currentCode === "ta"
              ? "வெளியேறு"
              : "Sign Out"}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — acts as the ag-sidebar-column in the dashboard flex layout */}
      <aside className="ag-sidebar-column hidden lg:flex lg:flex-col h-full overflow-y-auto overflow-x-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] z-50 lg:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-[#14532D] text-white hover:bg-[#16A34A] transition border-0 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
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