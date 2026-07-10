"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Grid, List as ListIcon, Filter, Tag, Info, Package, TrendingUp, Sparkles, Leaf } from "lucide-react";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";
import CropCard from "@/components/farmer/inventory/CropCard";
import CropPassportModal from "@/components/farmer/inventory/CropPassportModal";
import AddEditCropModal from "@/components/farmer/inventory/AddEditCropModal";
import { useDemoMode } from "@/context/DemoContext";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const { t } = useTranslation("farmer");
  const { isDemoMode } = useDemoMode();
  const { crops, loading, error, addCrop, updateCrop, duplicateCrop, archiveCrop, deleteCrop } = useFarmerInventory();

  // Navigation & layout states
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");

  // Modals state
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Computed summary metrics
  const summary = useMemo(() => {
    const total = crops.length;
    const active = crops.filter((c) => c.is_active).length;
    const available = crops.filter((c) => c.status === "available").length;
    const value = crops.reduce((sum, c) => sum + (c.farmer_price * c.quantity_available), 0);
    return { total, active, available, value };
  }, [crops]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(crops.map((c) => c.category));
    return ["All", ...Array.from(set)];
  }, [crops]);

  // Filtered crops
  const filteredCrops = useMemo(() => {
    return crops
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          (c.scientific_name || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || c.category === category;
        const matchesStatus = status === "All" || c.status === status;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "price-high") return b.farmer_price - a.farmer_price;
        if (sort === "price-low") return a.farmer_price - b.farmer_price;
        if (sort === "stock-high") return b.quantity_available - a.quantity_available;
        if (sort === "stock-low") return a.quantity_available - b.quantity_available;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [crops, search, category, status, sort]);

  const handleEditOpen = (crop: any) => {
    setSelectedCrop(crop);
    setEditModalOpen(true);
  };

  const handlePassportOpen = (crop: any) => {
    setSelectedCrop(crop);
    setPassportModalOpen(true);
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("farmCropInventory")}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage crop passports, traceability, and stock levels
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">{t("digitalPassports")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-200 shadow-sm">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-700">{t("aiPricing")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Leaf className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">Traceability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary row */}
      <motion.div 
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <motion.div custom={0} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Listings</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{summary.total}</p>
        </motion.div>
        
        <motion.div custom={1} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("activeProducts")}</p>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{summary.active}</p>
        </motion.div>
        
        <motion.div custom={2} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("availableStock")}</p>
          </div>
          <p className="text-3xl font-extrabold text-sky-600">{summary.available}</p>
        </motion.div>
        
        <motion.div custom={3} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Est. Value</p>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(summary.value)}
          </p>
        </motion.div>
      </motion.div>

      {/* Filter and search bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="premium-card rounded-3xl shadow-sm p-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="w-full md:w-[320px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("searchCropsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input text-sm pl-11 py-3 rounded-xl"
            />
          </div>

          {/* Filters row */}
          <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-3 justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer hover:border-slate-300 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white text-slate-850">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value={t("all")} className="bg-white text-slate-850">{t("allStatuses")}</option>
              <option value={t("available")} className="bg-white text-slate-850">{t("available")}</option>
              <option value="reserved" className="bg-white text-slate-850">Reserved</option>
              <option value="out_of_stock" className="bg-white text-slate-850">{t("outOfStock")}</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value={t("newest")} className="bg-white text-slate-850">Newest Listed</option>
              <option value="price-high" className="bg-white text-slate-850">{t("priceHighLow")}</option>
              <option value="price-low" className="bg-white text-slate-850">{t("priceLowHigh")}</option>
              <option value="stock-high" className="bg-white text-slate-850">Stock: High to Low</option>
              <option value="stock-low" className="bg-white text-slate-850">Stock: Low to High</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-2 rounded-lg transition border-0 cursor-pointer",
                  view === "grid" ? "bg-emerald-100 text-emerald-700 shadow-sm" : "text-slate-400 bg-transparent hover:text-slate-700"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-2 rounded-lg transition border-0 cursor-pointer",
                  view === "list" ? "bg-emerald-100 text-emerald-700 shadow-sm" : "text-slate-400 bg-transparent hover:text-slate-700"
                )}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Crop Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <button
          onClick={() => setAddModalOpen(true)}
          className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          {t("addCropListing")}
        </button>
      </motion.div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="premium-card shadow-sm h-80 rounded-3xl anim-shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="premium-card shadow-sm p-12 text-center rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 to-red-50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{t("errorLoadingInventory")}</h3>
          <p className="text-slate-500 text-sm font-semibold">{error}</p>
        </div>
      ) : filteredCrops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card shadow-sm p-16 text-center rounded-3xl space-y-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No crop listings found</h3>
          <p className="text-slate-500 text-sm font-semibold max-w-md mx-auto">
            Try adjusting search queries or add a new crop listing to get started with AgriNex.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
        >
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              view={view}
              onEdit={handleEditOpen}
              onViewPassport={handlePassportOpen}
              onDuplicate={duplicateCrop}
              onArchive={archiveCrop}
              onDelete={deleteCrop}
            />
          ))}
        </motion.div>
      )}

      {/* Add crop Modal */}
      {addModalOpen && (
        <AddEditCropModal
          onClose={() => setAddModalOpen(false)}
          onSave={addCrop}
        />
      )}

      {/* Edit crop Modal */}
      {editModalOpen && selectedCrop && (
        <AddEditCropModal
          crop={selectedCrop}
          onClose={() => {
            setSelectedCrop(null);
            setEditModalOpen(false);
          }}
          onSave={(data) => updateCrop(selectedCrop.id, data)}
        />
      )}

      {/* Digital passport Modal */}
      {passportModalOpen && selectedCrop && (
        <CropPassportModal
          crop={selectedCrop}
          onClose={() => {
            setSelectedCrop(null);
            setPassportModalOpen(false);
          }}
        />
      )}
    </div>
  );
}