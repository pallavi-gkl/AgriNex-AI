/**
 * @fileoverview Express auth middleware for AgriNex AI backend.
 * Validates Supabase JWT bearer tokens and attaches user context to req.
 */
import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Service-role client to validate JWTs server-side
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "farmer" | "consumer" | "admin";
    email?: string;
  };
}

/**
 * requireAuth — validates the Bearer JWT, resolves the profile role,
 * and attaches `req.user` for downstream route handlers.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Fetch role from profiles table
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    req.user = {
      id: user.id,
      role: (profile?.role as "farmer" | "consumer" | "admin") ?? "consumer",
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("[auth middleware]", err);
    res.status(500).json({ error: "Authentication service error" });
  }
}

/**
 * requireFarmer — extends requireAuth; rejects non-farmer callers.
 */
export async function requireFarmer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== "farmer") {
      res.status(403).json({ error: "Access restricted to farmers" });
      return;
    }
    next();
  });
}

/**
 * requireConsumer — extends requireAuth; rejects non-consumer callers.
 */
export async function requireConsumer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== "consumer") {
      res.status(403).json({ error: "Access restricted to consumers" });
      return;
    }
    next();
  });
}

/**
 * requireAdmin — extends requireAuth; rejects non-admin callers.
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Access restricted to admins" });
      return;
    }
    next();
  });
}
