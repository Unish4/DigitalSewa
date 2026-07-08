import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// GET /api/health
// Two purposes:
//   1. Render uses it to confirm the service is alive before routing traffic.
//   2. You can ping it manually before a demo to wake the free-tier instance
//      from its 15-minute inactivity sleep (~30s cold start on free tier).
router.get("/", async (req, res) => {
  const DB_STATES = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: DB_STATES[mongoose.connection.readyState] ?? "unknown",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

export default router;
