/**
 * @fileoverview Global TypeScript interfaces and types for AgriNex AI.
 * These types mirror the Supabase PostgreSQL schema exactly.
 */

// ============================================================
//  ENUM TYPES (matching Supabase ENUM definitions)
// ============================================================

export type UserRole = "farmer" | "consumer" | "admin";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "quality_verified"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// ============================================================
//  DATABASE TABLE INTERFACES
// ============================================================

/** Maps to `public.profiles` table */
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number: string;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  language_preference: string;
  trust_score: number;
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
}

/** Maps to `public.products` table */
export interface Product {
  id: string;
  farmer_id: string;
  title: string;
  description: string | null;
  category: string;
  price_per_unit: number;
  unit_type: string;
  quantity_available: number;
  image_url: string | null;
  quality_grade: string;
  quality_report: QualityReport;
  recommended_price: number | null;
  traceability_code: string | null;
  is_active: boolean;
  created_at: string;
  /** Joined farmer profile (optional, from API) */
  farmer?: Pick<Profile, "id" | "full_name" | "avatar_url" | "is_verified" | "trust_score">;
}

/** Maps to `public.orders` table */
export interface Order {
  id: string;
  consumer_id: string;
  farmer_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  tracking_history: TrackingEvent[];
  created_at: string;
  /** Joined data from API */
  consumer?: Pick<Profile, "id" | "full_name" | "avatar_url">;
  farmer?: Pick<Profile, "id" | "full_name" | "avatar_url">;
  order_items?: OrderItem[];
}

/** Maps to `public.order_items` table */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Pick<Product, "id" | "title" | "unit_type" | "image_url">;
}

/** Maps to `public.reviews` table */
export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Maps to `public.notifications` table */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

// ============================================================
//  JSONB NESTED TYPES
// ============================================================

/** Stored in `products.quality_report` (JSONB) */
export interface QualityReport {
  freshness: string;
  blemishes: string[];
  waterContentPercentage: number;
  estimatedShelfLifeDays: number;
  defectCoordinates?: Array<{ x: number; y: number; label: string }>;
}

/** One event in `orders.tracking_history` (JSONB array) */
export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  location?: { lat: number; lng: number };
}

// ============================================================
//  API RESPONSE TYPES
// ============================================================

/** Response from GET /api/farmer/analytics */
export interface FarmerAnalyticsResponse {
  summary: {
    totalEarnings: number;
    bagsSold: number;
    activeListings: number;
    trustScore: number;
  };
  chartData: ChartDataPoint[];
}

/** One data point for Recharts AreaChart */
export interface ChartDataPoint {
  month: string;
  personalEarnings: number;
  marketAverage: number;
}

/** Response from POST /api/ai/grade-crop */
export interface CropGradeResult {
  grade: "A+" | "A" | "B" | "C" | "D";
  freshness: string;
  waterContentPercentage: number;
  estimatedShelfLifeDays: number;
  blemishes: string[];
  recommendedPrice: number;
  rationale: string;
}

/** Payload for POST /api/products */
export interface CreateProductPayload {
  title: string;
  description: string;
  category: string;
  pricePerUnit: number;
  unitType: string;
  quantityAvailable: number;
  imageUrl?: string;
  qualityGrade?: string;
  qualityReport?: QualityReport;
  recommendedPrice?: number;
  traceabilityCode?: string;
}

// ============================================================
//  AI ENGINE TYPES (Phase 4)
// ============================================================

/** Input for POST /api/ai/recommend-price */
export interface PriceInput {
  cropType: string;
  grade: string;
  location: string;
  baseWholesalePrice: number;
}

/** Response from POST /api/ai/recommend-price */
export interface PriceResult {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  marketSentiment: "High Demand" | "Stable" | "Low Demand";
  rationale: string;
}

/** Response from POST /api/ai/voice-assistant */
export interface VoiceResult {
  action: "ADD_PRODUCT" | "CHECK_SALES" | "GET_PRICE" | "UNKNOWN";
  data: {
    cropType: string | null;
    quantity: number | null;
    unit: string | null;
    pricePerUnit: number | null;
  };
  speechFeedback: string;
}
