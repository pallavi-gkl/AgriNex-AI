/**
 * @fileoverview Supabase Database type definitions.
 * These are used to provide type-safety to the Supabase client.
 * Update after schema changes.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "farmer" | "consumer" | "admin";
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
        };
        Insert: {
          id: string;
          role?: "farmer" | "consumer" | "admin";
          full_name: string;
          phone_number: string;
          location_lat?: number | null;
          location_lng?: number | null;
          address?: string | null;
          language_preference?: string;
          trust_score?: number;
          is_verified?: boolean;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          role?: "farmer" | "consumer" | "admin";
          full_name?: string;
          phone_number?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          address?: string | null;
          language_preference?: string;
          trust_score?: number;
          is_verified?: boolean;
          avatar_url?: string | null;
        };
      };
      products: {
        Row: {
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
          quality_report: Json;
          recommended_price: number | null;
          traceability_code: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          title: string;
          description?: string | null;
          category: string;
          price_per_unit: number;
          unit_type: string;
          quantity_available: number;
          image_url?: string | null;
          quality_grade?: string;
          quality_report?: Json;
          recommended_price?: number | null;
          traceability_code?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string;
          price_per_unit?: number;
          unit_type?: string;
          quantity_available?: number;
          image_url?: string | null;
          quality_grade?: string;
          quality_report?: Json;
          recommended_price?: number | null;
          traceability_code?: string | null;
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          consumer_id: string;
          farmer_id: string;
          total_amount: number;
          status: "pending" | "accepted" | "quality_verified" | "dispatched" | "delivered" | "cancelled";
          payment_status: "pending" | "completed" | "failed" | "refunded";
          payment_id: string | null;
          delivery_address: string;
          delivery_lat: number | null;
          delivery_lng: number | null;
          tracking_history: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          consumer_id: string;
          farmer_id: string;
          total_amount: number;
          status?: "pending" | "accepted" | "quality_verified" | "dispatched" | "delivered" | "cancelled";
          payment_status?: "pending" | "completed" | "failed" | "refunded";
          payment_id?: string | null;
          delivery_address: string;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          tracking_history?: Json;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "quality_verified" | "dispatched" | "delivered" | "cancelled";
          payment_status?: "pending" | "completed" | "failed" | "refunded";
          payment_id?: string | null;
          tracking_history?: Json;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Update: {
          quantity?: number;
          price_at_purchase?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          comment?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          type: string;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
};
