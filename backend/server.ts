import express from "express";
import cors from "cors";
import { initDB } from "./db/initDB";
import { initAdminUser } from "./auth/initAdmin";
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

async function startServer() {
  // Initialize DB
  initDB();

  // Ensure default admin exists
  await initAdminUser();

  // Routes
  app.use("/auth", authRoutes);

  app.get("/health", (_req, res) => {
    res.json({ status: "Backend running" });
  });

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

// 🚀 Start everything
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
