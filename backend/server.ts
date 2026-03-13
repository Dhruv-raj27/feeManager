import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initDB } from "./db/initDB";
import { initAdminUser } from "./auth/initAdmin";
import { authenticate } from "./auth/authMiddleware";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import studentRoutes from "./routes/studentRoutes";
import feeStructureRoutes from "./routes/feeStructureRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import ledgerRoutes from "./routes/ledgerRoutes";
import receiptRoutes from "./routes/receiptRoutes";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

async function startServer() {
  // Initialize DB
  initDB();

  // Ensure default admin exists
  await initAdminUser();

  // Public routes (no auth required)
  app.use("/auth", authRoutes);
  app.get("/health", (_req, res) => {
    res.json({ status: "Backend running" });
  });

  // Protected routes (auth required)
  app.use("/students", authenticate, studentRoutes);
  app.use("/dashboard", authenticate, dashboardRoutes);
  app.use("/fees", authenticate, feeStructureRoutes);
  app.use("/payments", authenticate, paymentRoutes);
  app.use("/settings", authenticate, settingsRoutes);
  app.use("/ledger", authenticate, ledgerRoutes);
  app.use("/receipts", authenticate, receiptRoutes);

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

// 🚀 Start everything
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

