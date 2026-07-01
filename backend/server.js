// ─── Config 
import ENV from "./src/config/env.js";
import connectDB from "./src/config/db.js";

// ─── Core 
import express from "express";

// ─── Security & Logging 
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

// ─── Routes ───────────────────────────────────────────────
// (none yet — added phase by phase from Phase 3 onward)

// ─── Error Handlers ───────────────────────────────────────
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

// Security headers — must be first middleware
app.use(helmet());

// HTTP request logging — dev only
if (ENV.NODE_ENV !== "production") app.use(morgan("dev"));

// Allow cross-origin requests from the frontend (cookie-safe)
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes 
// (mounted here as phases are added)

// ─── Error middleware — must be last 
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(
        `Server running at http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
