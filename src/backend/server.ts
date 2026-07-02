/**
 * @fileoverview Express.js backend entry point for AgriNex AI.
 * Mounts all API route modules and starts the HTTP server.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import farmerRouter from "./routes/farmer";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";
import aiRouter from "./routes/ai";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─────────────────────────────────────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Build CORS origin list: always allow localhost + optionally the production URL
const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// CORS_ORIGIN can be a single URL or comma-separated list e.g.:
//   CORS_ORIGIN=https://agrinex-ai.vercel.app
//   CORS_ORIGIN=https://agrinex-ai.vercel.app,https://agrinex-preview.vercel.app
if (process.env.CORS_ORIGIN) {
  const productionOrigins = process.env.CORS_ORIGIN.split(",").map((o) => o.trim());
  allowedOrigins.push(...productionOrigins);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "AgriNex AI Backend", timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// API Route Mounts
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api/farmer", farmerRouter);      // GET /api/farmer/analytics, GET /api/farmer/orders
app.use("/api/products", productsRouter);   // POST /api/products, GET /api/products
app.use("/api/orders", ordersRouter);       // POST /api/orders, PATCH /api/orders/:id/status
app.use("/api/reviews", reviewsRouter);     // POST /api/reviews
app.use("/api/ai", aiRouter);              // POST /api/ai/grade-crop, POST /api/ai/recommend-price
app.use("/api/admin", adminRouter);        // Admin APIs (KYC, Disputes, Users, Broadcasts)

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Unhandled Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ AgriNex AI Backend running at http://localhost:${PORT}`);
  console.log(`   → Health: http://localhost:${PORT}/health`);
  console.log(`   → Products API: http://localhost:${PORT}/api/products`);
  console.log(`   → Farmer API: http://localhost:${PORT}/api/farmer/analytics`);
  console.log(`   → AI API: http://localhost:${PORT}/api/ai (grade-crop, recommend-price, voice-assistant)\n`);
});

export default app;
