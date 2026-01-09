import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";
import insightsRoutes from "./routes/insights.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRouter);
const port = process.env.PORT || 4000;

(async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
})();
