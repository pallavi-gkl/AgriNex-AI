/**
 * @fileoverview Products API routes for AgriNex AI.
 * Routes:
 *   POST /api/products  — create a new farmer listing
 *   GET  /api/products  — public marketplace listing with search/filter
 */
import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireFarmer, AuthenticatedRequest } from "../middleware/auth";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/products
// Create a new product listing with optional AI quality report.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  requireFarmer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const farmerId = req.user!.id;
    const {
      title,
      description,
      category,
      pricePerUnit,
      unitType,
      quantityAvailable,
      imageUrl,
      qualityGrade,
      qualityReport,
      recommendedPrice,
    } = req.body;

    // Validate required fields
    if (!title || !category || !pricePerUnit || !unitType || !quantityAvailable) {
      res.status(400).json({
        error: "Missing required fields: title, category, pricePerUnit, unitType, quantityAvailable",
      });
      return;
    }

    // Auto-generate traceability code: ANX-{STATE}-{CROP}-{RANDOM}
    const cropCode = title.replace(/\s+/g, "").toUpperCase().slice(0, 4);
    const traceabilityCode = `ANX-${cropCode}-${nanoid(6).toUpperCase()}`;

    // Normalize pomegranate to Fruits category
    let finalCategory = category;
    const isPomegranate = title.toLowerCase().includes("pomegranate") || category.toLowerCase().includes("pomegranate");
    if (isPomegranate) {
      finalCategory = "Fruits";
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          farmer_id: farmerId,
          title,
          description: description ?? null,
          category: finalCategory,
          price_per_unit: parseFloat(pricePerUnit),
          unit_type: unitType,
          quantity_available: parseFloat(quantityAvailable),
          image_url: imageUrl ?? null,
          quality_grade: qualityGrade ?? "N/A",
          quality_report: qualityReport ?? {},
          recommended_price: recommendedPrice ? parseFloat(recommendedPrice) : null,
          traceability_code: traceabilityCode,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (err: any) {
      console.error("[POST /api/products]", err);
      res.status(500).json({ error: "Failed to create product listing" });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products
// Public endpoint — consumer marketplace product feed with search + filters.
// Query params: search, category, lat, lng, maxDistance (km)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const { search, category, lat, lng, maxDistance } = req.query;

    try {
      let query = supabase
        .from("products")
        .select(`
          id,
          title,
          description,
          category,
          price_per_unit,
          unit_type,
          quantity_available,
          image_url,
          quality_grade,
          quality_report,
          recommended_price,
          traceability_code,
          created_at,
          farmer:profiles!products_farmer_id_fkey (
            id,
            full_name,
            avatar_url,
            is_verified,
            trust_score,
            location_lat,
            location_lng
          )
        `)
        .eq("is_active", true)
        .gt("quantity_available", 0)
        .order("created_at", { ascending: false });

      // Text search filter (case-insensitive)
      if (search && typeof search === "string" && search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      // Category filter
      if (category && category !== "All") {
        if (category === "Fruits" || category === "Fruit") {
          query = query.or("category.eq.Fruits,category.eq.Fruit,title.ilike.%pomegranate%,category.ilike.%pomegranate%");
        } else {
          query = query.eq("category", category as string);
        }
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Haversine distance filter (if lat/lng provided)
      let products = data ?? [];

      // Filter out Pomegranate from Spices category (or any non-Fruits category)
      if (category && category !== "All" && category !== "Fruits" && category !== "Fruit") {
        products = products.filter((p: any) => {
          const titleLower = (p.title ?? "").toLowerCase();
          const categoryLower = (p.category ?? "").toLowerCase();
          return !titleLower.includes("pomegranate") && !categoryLower.includes("pomegranate");
        });
      }
      if (lat && lng && maxDistance) {
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        const maxDist = parseFloat(maxDistance as string) || 50;

        products = products.filter((p: any) => {
          const farmer = p.farmer;
          if (!farmer?.location_lat || !farmer?.location_lng) return true; // include if no coords
          const dist = haversineKm(userLat, userLng, farmer.location_lat, farmer.location_lng);
          return dist <= maxDist;
        });
      }

      // Normalize field names for frontend camelCase convention
      const normalized = products.map((p: any) => {
        const titleLower = (p.title ?? "").toLowerCase();
        const categoryLower = (p.category ?? "").toLowerCase();
        const isPomegranate = titleLower.includes("pomegranate") || categoryLower.includes("pomegranate");
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          category: isPomegranate ? "Fruits" : p.category,
          pricePerUnit: p.price_per_unit,
          unitType: p.unit_type,
          quantityAvailable: p.quantity_available,
          imageUrl: p.image_url,
          qualityGrade: p.quality_grade,
          qualityReport: p.quality_report,
          recommendedPrice: p.recommended_price,
          traceabilityCode: p.traceability_code,
          createdAt: p.created_at,
          farmer: p.farmer
            ? {
                id: p.farmer.id,
                fullName: p.farmer.full_name,
                avatarUrl: p.farmer.avatar_url,
                isVerified: p.farmer.is_verified,
                trustScore: p.farmer.trust_score,
                locationLat: p.farmer.location_lat,
                locationLng: p.farmer.location_lng,
              }
            : null,
        };
      });

      res.json(normalized);
    } catch (err: any) {
      console.error("[GET /api/products]", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

/** Haversine formula — distance in km between two lat/lng points */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/products/:id
// Update an existing product listing
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
  "/:id",
  requireFarmer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const farmerId = req.user!.id;
    const { id } = req.params;
    const {
      title,
      description,
      category,
      pricePerUnit,
      unitType,
      quantityAvailable,
      imageUrl,
      qualityGrade,
      qualityReport,
      recommendedPrice,
      isActive,
    } = req.body;

    try {
      // First verify ownership
      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("farmer_id")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (existingProduct.farmer_id !== farmerId) {
        res.status(403).json({ error: "Unauthorized to modify this product" });
        return;
      }

      const updatePayload: any = {};
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (category !== undefined) updatePayload.category = category;
      if (pricePerUnit !== undefined) updatePayload.price_per_unit = parseFloat(pricePerUnit);
      if (unitType !== undefined) updatePayload.unit_type = unitType;
      if (quantityAvailable !== undefined) updatePayload.quantity_available = parseFloat(quantityAvailable);
      if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
      if (qualityGrade !== undefined) updatePayload.quality_grade = qualityGrade;
      if (qualityReport !== undefined) updatePayload.quality_report = qualityReport;
      if (recommendedPrice !== undefined) updatePayload.recommended_price = recommendedPrice ? parseFloat(recommendedPrice) : null;
      if (isActive !== undefined) updatePayload.is_active = isActive;

      const { data, error } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      console.error("[PATCH /api/products/:id]", err);
      res.status(500).json({ error: "Failed to update product listing" });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/products/:id
// Delete a product listing
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
  "/:id",
  requireFarmer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const farmerId = req.user!.id;
    const { id } = req.params;

    try {
      // First verify ownership
      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("farmer_id")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (existingProduct.farmer_id !== farmerId) {
        res.status(403).json({ error: "Unauthorized to delete this product" });
        return;
      }

      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err: any) {
      console.error("[DELETE /api/products/:id]", err);
      res.status(500).json({ error: "Failed to delete product listing" });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/products/:id/duplicate
// Duplicate a product listing
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/:id/duplicate",
  requireFarmer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const farmerId = req.user!.id;
    const { id } = req.params;

    try {
      // Retrieve existing product
      const { data: prod, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !prod) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (prod.farmer_id !== farmerId) {
        res.status(403).json({ error: "Unauthorized to duplicate this product" });
        return;
      }

      const cropCode = prod.title.replace(/\s+/g, "").toUpperCase().slice(0, 4);
      const traceabilityCode = `ANX-${cropCode}-${nanoid(6).toUpperCase()}`;

      const { data, error } = await supabase
        .from("products")
        .insert({
          farmer_id: farmerId,
          title: `${prod.title} (Copy)`,
          description: prod.description,
          category: prod.category,
          price_per_unit: prod.price_per_unit,
          unit_type: prod.unit_type,
          quantity_available: prod.quantity_available,
          image_url: prod.image_url,
          quality_grade: prod.quality_grade,
          quality_report: prod.quality_report,
          recommended_price: prod.recommended_price,
          traceability_code: traceabilityCode,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      console.error("[POST /api/products/:id/duplicate]", err);
      res.status(500).json({ error: "Failed to duplicate product listing" });
    }
  }
);

export default router;
