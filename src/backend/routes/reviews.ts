/**
 * @fileoverview Reviews API routes for AgriNex AI.
 * Route: POST /api/reviews — consumer submits post-purchase review,
 *        triggers trust_score recalculation for the reviewed farmer.
 */
import { Router, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireConsumer, AuthenticatedRequest } from "../middleware/auth";
import dotenv from "dotenv";
import { cleanEnvVar } from "../../lib/env";

dotenv.config();

const router = Router();

const supabase = createClient(
  cleanEnvVar(process.env.SUPABASE_URL),
  cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY)
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reviews
// Consumer submits a 1–5 star rating + comment. Recalculates farmer trust_score.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  requireConsumer,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reviewerId = req.user!.id;
    const { orderId, revieweeId, rating, comment } = req.body;

    if (!orderId || !revieweeId || !rating) {
      res.status(400).json({
        error: "Missing required fields: orderId, revieweeId, rating",
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    try {
      // Insert review (unique per order enforced by DB constraint)
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .insert({
          order_id: orderId,
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          rating: parseInt(rating),
          comment: comment ?? null,
        })
        .select()
        .single();

      if (reviewError) {
        if (reviewError.code === "23505") {
          res.status(409).json({ error: "You have already reviewed this order" });
        } else {
          throw reviewError;
        }
        return;
      }

      // Recalculate farmer's aggregate trust_score (avg of all their reviews)
      const { data: allReviews, error: ratingError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", revieweeId);

      if (!ratingError && allReviews && allReviews.length > 0) {
        const avgRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await supabase
          .from("profiles")
          .update({ trust_score: Math.round(avgRating * 100) / 100 })
          .eq("id", revieweeId);
      }

      res.status(201).json(review);
    } catch (err: any) {
      console.error("[POST /api/reviews]", err);
      res.status(500).json({ error: "Failed to submit review" });
    }
  }
);

export default router;
