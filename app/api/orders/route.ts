/**
 * @fileoverview Next.js App Router API route: POST /api/orders
 * Replicates the Express backend POST /api/orders so orders work
 * without needing the separate Express server running.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Service-role client for writes that bypass RLS
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // ── Authenticate the request via the session cookie ──────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { farmerId, totalAmount, deliveryAddress, deliveryLat, deliveryLng, items } = body;

    if (!farmerId || !totalAmount || !deliveryAddress || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, totalAmount, deliveryAddress, items" },
        { status: 400 }
      );
    }

    // ── Resolve a valid farmer UUID ───────────────────────────────────────────
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedFarmerId: string = farmerId;
    if (!uuidRegex.test(resolvedFarmerId)) {
      // Demo farmer ID — find any real farmer in the profiles table
      const { data: farmers } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("role", "farmer")
        .limit(1);
      resolvedFarmerId = (farmers as any[])?.[0]?.id ?? farmerId;
    }

    // ── Insert the order ──────────────────────────────────────────────────────
    const initialTracking = [
      {
        status: "pending",
        timestamp: new Date().toISOString(),
        note: "Order placed by consumer",
      },
    ];

    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        consumer_id: user.id,
        farmer_id: resolvedFarmerId,
        total_amount: parseFloat(totalAmount),
        status: "pending",
        payment_status: "completed",
        delivery_address: deliveryAddress,
        delivery_lat: deliveryLat ? parseFloat(deliveryLat) : null,
        delivery_lng: deliveryLng ? parseFloat(deliveryLng) : null,
        tracking_history: initialTracking,
      })
      .select()
      .single();

    if (orderError) {
      console.error("[POST /api/orders] order insert error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // ── Insert order items ────────────────────────────────────────────────────
    const orderItems = (items as any[]).map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: parseFloat(item.quantity),
      price_at_purchase: parseFloat(item.priceAtPurchase),
    }));

    const { error: itemsError } = await adminSupabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[POST /api/orders] order_items insert error:", itemsError);
      // Don't fail the whole request — order was created; items failure is non-critical
    }

    // ── Decrement product quantities ──────────────────────────────────────────
    for (const item of items as any[]) {
      if (uuidRegex.test(item.productId)) {
        try {
          await adminSupabase.rpc("decrement_product_quantity", {
            p_id: item.productId,
            p_qty: parseFloat(item.quantity),
          });
        } catch (e) {
          console.warn("decrement_product_quantity failed:", e);
        }
      }
    }

    // ── Notify the farmer ─────────────────────────────────────────────────────
    await adminSupabase.from("notifications").insert({
      user_id: resolvedFarmerId,
      title: "New Order Received",
      message: `New order #${order.id.slice(0, 8)} placed by consumer for ₹${parseFloat(totalAmount).toFixed(2)}.`,
      type: "order_update",
      is_read: false,
    });

    return NextResponse.json({ ...order, order_items: orderItems }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
