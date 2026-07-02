"use client";

import { useState, useEffect } from "react";
import { useDemoMode } from "@/context/DemoContext";
import { DEMO_CROPS } from "@/lib/demoData";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export function useFarmerInventory() {
  const { isDemoMode } = useDemoMode();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load crops
  const loadCrops = async () => {
    setLoading(true);
    setError(null);
    if (isDemoMode) {
      // Load from localStorage or initialize with DEMO_CROPS
      const local = localStorage.getItem("agrinex_farmer_crops");
      if (local) {
        setCrops(JSON.parse(local));
      } else {
        localStorage.setItem("agrinex_farmer_crops", JSON.stringify(DEMO_CROPS));
        setCrops(DEMO_CROPS);
      }
      setLoading(false);
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCrops(data || []);
      } catch (err: any) {
        console.error("Failed to load crops:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCrops();
  }, [isDemoMode]);

  // Save changes locally in demo mode or reload in live mode
  const syncCrops = (updatedCrops: any[]) => {
    setCrops(updatedCrops);
    if (isDemoMode) {
      localStorage.setItem("agrinex_farmer_crops", JSON.stringify(updatedCrops));
    }
  };

  // Add new crop
  const addCrop = async (cropData: any) => {
    if (isDemoMode) {
      const newCrop = {
        id: `crop-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...cropData,
        is_organic: cropData.is_organic ?? false,
        rating: cropData.rating ?? 5.0,
        reviews_count: cropData.reviews_count ?? 0,
        is_verified: true,
      };
      const updated = [newCrop, ...crops];
      syncCrops(updated);
      return newCrop;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase
        .from("products") as any)
        .insert({
          farmer_id: user.id,
          title: cropData.title,
          description: cropData.description,
          category: cropData.category,
          price_per_unit: cropData.price_per_unit,
          unit_type: cropData.unit_type,
          quantity_available: cropData.quantity_available,
          image_url: cropData.image_url || cropData.imageUrl || null,
          quality_grade: cropData.quality_grade || "A",
          recommended_price: cropData.recommended_price || null,
          is_active: cropData.is_active ?? true,
          // Store extended agricultural parameters in quality_report JSONB
          quality_report: {
            scientific_name: cropData.scientific_name,
            production_date: cropData.production_date,
            harvest_date: cropData.harvest_date,
            supply_start_date: cropData.supply_start_date,
            supply_end_date: cropData.supply_end_date,
            shelf_life_days: cropData.shelf_life_days,
            storage_temp: cropData.storage_temp,
            storage_condition: cropData.storage_condition,
            ai_freshness_score: cropData.ai_freshness_score,
            ai_disease_score: cropData.ai_disease_score,
            ai_pest_score: cropData.ai_pest_score,
            certificates: cropData.certificates || [],
            gps_lat: cropData.gps_lat,
            gps_lng: cropData.gps_lng,
            warehouse_location: cropData.warehouse_location,
            traceability_code: cropData.traceability_code,
          },
        } as any)
        .select()
        .single();

      if (error) throw error;
      loadCrops();
      return data;
    }
  };

  // Edit crop
  const updateCrop = async (id: string, updatedData: any) => {
    if (isDemoMode) {
      const updated = crops.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
      syncCrops(updated);
    } else {
      const { error } = await (supabase
        .from("products") as any)
        .update({
          title: updatedData.title,
          description: updatedData.description,
          category: updatedData.category,
          price_per_unit: updatedData.price_per_unit,
          unit_type: updatedData.unit_type,
          quantity_available: updatedData.quantity_available,
          image_url: updatedData.image_url || updatedData.imageUrl || null,
          quality_grade: updatedData.quality_grade,
          recommended_price: updatedData.recommended_price,
          is_active: updatedData.is_active,
          quality_report: {
            scientific_name: updatedData.scientific_name,
            production_date: updatedData.production_date,
            harvest_date: updatedData.harvest_date,
            supply_start_date: updatedData.supply_start_date,
            supply_end_date: updatedData.supply_end_date,
            shelf_life_days: updatedData.shelf_life_days,
            storage_temp: updatedData.storage_temp,
            storage_condition: updatedData.storage_condition,
            ai_freshness_score: updatedData.ai_freshness_score,
            ai_disease_score: updatedData.ai_disease_score,
            ai_pest_score: updatedData.ai_pest_score,
            certificates: updatedData.certificates || [],
            gps_lat: updatedData.gps_lat,
            gps_lng: updatedData.gps_lng,
            warehouse_location: updatedData.warehouse_location,
            traceability_code: updatedData.traceability_code,
          },
        } as any)
        .eq("id", id);

      if (error) throw error;
      loadCrops();
    }
  };

  // Duplicate crop
  const duplicateCrop = async (id: string) => {
    const cropToDup = crops.find((c) => c.id === id);
    if (!cropToDup) return;

    if (isDemoMode) {
      const duplicated = {
        ...cropToDup,
        id: `crop-${Date.now()}`,
        title: `${cropToDup.title} (Copy)`,
        created_at: new Date().toISOString(),
      };
      const updated = [duplicated, ...crops];
      syncCrops(updated);
    } else {
      await addCrop({
        ...cropToDup,
        title: `${cropToDup.title} (Copy)`,
      });
    }
  };

  // Archive (deactivate) crop
  const archiveCrop = async (id: string) => {
    const crop = crops.find((c) => c.id === id);
    if (!crop) return;
    const is_active = !crop.is_active;

    if (isDemoMode) {
      const updated = crops.map((c) =>
        c.id === id ? { ...c, is_active, status: is_active ? "available" : "out_of_stock" } : c
      );
      syncCrops(updated);
    } else {
      const { error } = await (supabase
        .from("products") as any)
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
      loadCrops();
    }
  };

  // Delete crop
  const deleteCrop = async (id: string) => {
    if (isDemoMode) {
      const updated = crops.filter((c) => c.id !== id);
      syncCrops(updated);
    } else {
      const { error } = await (supabase
        .from("products") as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      loadCrops();
    }
  };

  return {
    crops,
    loading,
    error,
    addCrop,
    updateCrop,
    duplicateCrop,
    archiveCrop,
    deleteCrop,
    refetch: loadCrops,
  };
}
