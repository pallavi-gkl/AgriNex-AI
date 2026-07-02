/**
 * @fileoverview Orders API routes for AgriNex AI.
 * Routes:
 *   POST  /api/orders                      — consumer creates a new order
 *   PATCH /api/orders/:id/status           — farmer accepts / dispatches an order
 *                                            (Phase 5: also appends tracking_history + notifications + OTP)
 *   GET   /api/orders/:id/route            — returns simulated courier GPS data
 *   POST  /api/orders/:id/verify-delivery  — validates OTP, marks delivered
 */
import { Router, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  requireAuth,
  requireFarmer,
  requireConsumer,
  AuthenticatedRequest,
} from "../middleware/auth";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Consumer places a new order. Creates `orders` + `order_items` rows.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  requireConsumer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const consumerId = req.user!.id;
    const {
      farmerId,
      totalAmount,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      items,
    } = req.body;

    if (!farmerId || !totalAmount || !deliveryAddress || !items?.length) {
      res.status(400).json({
        error: "Missing required fields: farmerId, totalAmount, deliveryAddress, items",
      });
      return;
    }

    try {
      // Create the order
      const initialTracking = [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          note: "Order placed by consumer",
        },
      ];

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          consumer_id: consumerId,
          farmer_id: farmerId,
          total_amount: parseFloat(totalAmount),
          status: "pending",
          payment_status: "completed", // simulated payment
          delivery_address: deliveryAddress,
          delivery_lat: deliveryLat ? parseFloat(deliveryLat) : null,
          delivery_lng: deliveryLng ? parseFloat(deliveryLng) : null,
          tracking_history: initialTracking,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = (items as any[]).map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: parseFloat(item.quantity),
        price_at_purchase: parseFloat(item.priceAtPurchase),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Decrement product quantity
      for (const item of items as any[]) {
        await supabase.rpc("decrement_product_quantity", {
          p_id: item.productId,
          p_qty: parseFloat(item.quantity),
        });
      }

      // Notify farmer about new order
      await supabase.from("notifications").insert({
        user_id: farmerId,
        title: "New Order Received",
        message: `New order #${order.id.slice(0, 8)} placed by consumer for ₹${parseFloat(totalAmount).toFixed(2)}.`,
        type: "order_update",
        is_read: false,
      });

      res.status(201).json({ ...order, order_items: orderItems });
    } catch (err: any) {
      console.error("[POST /api/orders]", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status
// Farmer accepts (→ accepted) or dispatches (→ dispatched) an order.
// Phase 5 Extension:
//   - Appends event to tracking_history JSONB
//   - Inserts a notification for the relevant party
//   - On "dispatched": generates 4-digit OTP, stores in payment_id, notifies consumer
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
  "/:id/status",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, note, driverId } = req.body;

    const validStatuses = [
      "accepted",
      "quality_verified",
      "dispatched",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    try {
      // Fetch current order
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("id, farmer_id, consumer_id, status, tracking_history, payment_id")
        .eq("id", id)
        .single();

      if (fetchError || !order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const userId = req.user!.id;
      const isFarmer = order.farmer_id === userId;
      const isConsumer = order.consumer_id === userId;

      if (!isFarmer && !isConsumer) {
        res.status(403).json({ error: "Not authorized to update this order" });
        return;
      }

      // Build tracking event
      const newEvent: Record<string, any> = {
        status,
        timestamp: new Date().toISOString(),
        note: note ?? `Order ${status}`,
      };
      if (driverId) newEvent.driverId = driverId;

      const updatedTracking = [
        ...((order.tracking_history as any[]) ?? []),
        newEvent,
      ];

      // Base order update payload
      const updatePayload: Record<string, any> = {
        status,
        tracking_history: updatedTracking,
      };

      // ── OTP Generation (Phase 5) ──────────────────────────────────────────
      // When dispatched: generate a 4-digit OTP, store as "OTP:{code}" in payment_id
      let generatedOtp: string | null = null;
      if (status === "dispatched") {
        generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        updatePayload.payment_id = `OTP:${generatedOtp}`;
      }

      // Persist status + tracking + optional OTP
      const { data: updated, error: updateError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // ── Notifications (Phase 5) ───────────────────────────────────────────
      // Notify the other party about the status change
      const notifyUserId =
        status === "accepted" || status === "dispatched" || status === "delivered"
          ? order.consumer_id
          : order.farmer_id;

      await supabase.from("notifications").insert({
        user_id: notifyUserId,
        title: `Order #${id.slice(0, 8)} Update`,
        message: newEvent.note,
        type: "order_update",
        is_read: false,
      });

      // If dispatched, send OTP notification to consumer
      if (status === "dispatched" && generatedOtp) {
        await supabase.from("notifications").insert({
          user_id: order.consumer_id,
          title: "🔐 Delivery OTP",
          message: `Your delivery OTP is ${generatedOtp}. Share it with the courier on arrival to confirm receipt.`,
          type: "order_update",
          is_read: false,
        });
      }

      res.json({
        orderId: id,
        currentStatus: status,
        updatedAt: newEvent.timestamp,
        trackingHistory: updatedTracking,
        ...(updated as object),
      });
    } catch (err: any) {
      console.error("[PATCH /api/orders/:id/status]", err);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id/route
// Returns farmer/consumer coordinates plus simulated current courier location.
// Courier position is interpolated based on how long ago the order was dispatched.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:id/route",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          id, status, tracking_history, created_at,
          farmer_id, consumer_id,
          delivery_lat, delivery_lng,
          farmer:profiles!orders_farmer_id_fkey(location_lat, location_lng),
          consumer:profiles!orders_consumer_id_fkey(location_lat, location_lng)
        `)
        .eq("id", id)
        .single();

      if (error || !order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Extract coordinates — fall back to Pune (demo) if not set
      const farmer = (order.farmer as any)?.[0] ?? order.farmer;
      const consumer = (order.consumer as any)?.[0] ?? order.consumer;

      const farmerCoords = {
        lat: (farmer?.location_lat as number) ?? 18.5204,
        lng: (farmer?.location_lng as number) ?? 73.8567,
      };

      const consumerCoords = {
        lat: (order.delivery_lat as number) ??
             (consumer?.location_lat as number) ??
             18.556,
        lng: (order.delivery_lng as number) ??
             (consumer?.location_lng as number) ??
             73.882,
      };

      // Find when order was dispatched
      const history = (order.tracking_history as any[]) ?? [];
      const dispatchEvent = history.find((e: any) => e.status === "dispatched");

      let progress = 0; // 0 = at farmer, 1 = at consumer
      let estimatedTimeRemainingMin = 30;

      if (dispatchEvent) {
        const dispatchedAt = new Date(dispatchEvent.timestamp).getTime();
        const now = Date.now();
        const elapsedMs = now - dispatchedAt;
        const totalTripMs = 30 * 60 * 1000; // simulate 30-minute delivery
        progress = Math.min(elapsedMs / totalTripMs, 0.98);
        estimatedTimeRemainingMin = Math.max(
          Math.round(((1 - progress) * 30)),
          1
        );
      }

      // Interpolate courier position
      const currentCourierCoords = {
        lat: farmerCoords.lat + (consumerCoords.lat - farmerCoords.lat) * progress,
        lng: farmerCoords.lng + (consumerCoords.lng - farmerCoords.lng) * progress,
      };

      // Haversine distance remaining
      const R = 6371;
      const dLat = ((consumerCoords.lat - currentCourierCoords.lat) * Math.PI) / 180;
      const dLng = ((consumerCoords.lng - currentCourierCoords.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((currentCourierCoords.lat * Math.PI) / 180) *
          Math.cos((consumerCoords.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distanceRemainingKm = parseFloat(
        (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)
      );

      res.json({
        orderId: id,
        status: order.status,
        farmerCoords,
        consumerCoords,
        currentCourierCoords,
        estimatedTimeRemainingMin,
        distanceRemainingKm,
        progress,
      });
    } catch (err: any) {
      console.error("[GET /api/orders/:id/route]", err);
      res.status(500).json({ error: "Failed to fetch route data" });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/verify-delivery
// Consumer submits OTP to confirm delivery.
// Validates against stored OTP:{code} in payment_id column.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/:id/verify-delivery",
  requireConsumer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp || typeof otp !== "string") {
      res.status(400).json({ error: "OTP is required" });
      return;
    }

    try {
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("id, consumer_id, farmer_id, status, payment_id, tracking_history")
        .eq("id", id)
        .single();

      if (fetchError || !order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Only the consumer for this order can verify
      if (order.consumer_id !== req.user!.id) {
        res.status(403).json({ error: "Not authorized" });
        return;
      }

      if (order.status === "delivered") {
        res.json({ success: true, message: "Order already delivered." });
        return;
      }

      // Extract stored OTP
      const storedOtp = (order.payment_id as string)?.replace("OTP:", "") ?? null;

      if (!storedOtp || storedOtp !== otp.trim()) {
        res.status(400).json({ error: "Invalid OTP. Please check and try again." });
        return;
      }

      // Append delivered event
      const deliveredEvent = {
        status: "delivered",
        timestamp: new Date().toISOString(),
        note: "OTP verified. Order delivered successfully.",
      };

      const updatedTracking = [
        ...((order.tracking_history as any[]) ?? []),
        deliveredEvent,
      ];

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          tracking_history: updatedTracking,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Notify farmer that order was delivered
      await supabase.from("notifications").insert({
        user_id: order.farmer_id,
        title: `Order #${id.slice(0, 8)} Delivered`,
        message: "OTP verified. The consumer has confirmed delivery.",
        type: "order_update",
        is_read: false,
      });

      res.json({
        success: true,
        message: "Delivery confirmed! Thank you for your order.",
        orderId: id,
        deliveredAt: deliveredEvent.timestamp,
      });
    } catch (err: any) {
      console.error("[POST /api/orders/:id/verify-delivery]", err);
      res.status(500).json({ error: "Failed to verify delivery" });
    }
  }
);

export default router;
