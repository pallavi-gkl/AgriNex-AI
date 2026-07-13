/**
 * @fileoverview useProducts — TanStack Query hooks for products.
 * - useCreateProduct: mutation for POST /api/products (farmer use)
 * - useMarketplaceProducts: query for GET /api/products (consumer use)
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, getValidAuthToken } from "@/lib/supabase";
import type { CreateProductPayload, Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Create product (farmer) ──────────────────────────────────────────────────
interface CreateProductInput extends CreateProductPayload {
  token?: string;
}

async function postProduct(payload: CreateProductInput): Promise<Product> {
  const { token, ...body } = payload;

  let authToken = "";
  if (token && typeof token === "string") {
    authToken = token.trim().replace(/[\r\n]+/g, "");
    if (authToken.startsWith("Bearer ")) {
      authToken = authToken.substring(7).trim().replace(/[\r\n]+/g, "");
    }
  } else {
    authToken = await getValidAuthToken();
  }

  if (!authToken) {
    throw new Error("Please login to continue.");
  }

  const res = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create product");
  }
  return res.json();
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postProduct,
    onSuccess: () => {
      // Invalidate marketplace and farmer products caches
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["farmerAnalytics"] });
    },
  });
}

// ─── Marketplace product listing (consumer) ───────────────────────────────────
interface ProductFilters {
  search?: string;
  category?: string;
  lat?: number;
  lng?: number;
  maxDistance?: number;
}

async function fetchProducts(filters: ProductFilters): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters.search)      params.set("search",      filters.search);
  if (filters.category && filters.category !== "All")
                            params.set("category",    filters.category);
  if (filters.lat)          params.set("lat",         String(filters.lat));
  if (filters.lng)          params.set("lng",         String(filters.lng));
  if (filters.maxDistance)  params.set("maxDistance", String(filters.maxDistance));

  const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function useMarketplaceProducts(filters: ProductFilters = {}) {
  return useQuery<any[]>({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}
