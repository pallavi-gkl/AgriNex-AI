"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Grid, List as ListIcon, Filter, Tag, Info } from "lucide-react";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";
import CropCard from "@/components/farmer/inventory/CropCard";
import CropPassportModal from "@/components/farmer/inventory/CropPassportModal";
import AddEditCropModal from "@/components/farmer/inventory/AddEditCropModal";
import { useDemoMode } from "@/context/DemoContext";

export default function InventoryPage() {
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

  return (
    <div className="space-y-6">
      {/* Welcome & Action Summary banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Farm Crop Inventory</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Manage crop passports, traceability timelines, pricing recommendations, and stock levels.
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black" />
          Add Crop Listing
        </button>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-mono">TOTAL LISTINGS</p>
          <p className="text-xl font-bold text-white mt-1">{summary.total}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-mono">ACTIVE PRODUCTS</p>
          <p className="text-xl font-bold text-white mt-1">{summary.active}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-mono">AVAILABLE STOCK</p>
          <p className="text-xl font-bold text-white mt-1">{summary.available}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-mono">TOTAL EST. VALUE</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(summary.value)}
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="w-full md:w-[300px] relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title or scientific name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Filters row */}
          <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-3 justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-lg transition ${view === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-white"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-lg transition ${view === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-white"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel h-80 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center text-red-400 rounded-2xl">
          Error loading inventory: {error}
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <Info className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No crop listings found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Try adjusting search queries or add a new crop listing to get started with AgriNex.
          </p>
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
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
        </div>
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
