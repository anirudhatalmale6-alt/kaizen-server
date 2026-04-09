import express from "express";
import cors from "cors";
import "./config/env.js";
import { connectDB } from "./config/db.js";
import initiativeRoutes from "./modules/initiatives/initiative.routes.js";
import voteRoutes from "./modules/votes/votes.routes.js";
import metricsRoutes from "./modules/metrics/metrics.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import r2Client from "./utils/r2.js";

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// File proxy endpoint - streams files from R2 through the server (private access)
app.get("/api/files/view", async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ success: false, message: "File key is required" });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    // Set appropriate headers
    if (response.ContentType) res.set("Content-Type", response.ContentType);
    if (response.ContentLength) res.set("Content-Length", response.ContentLength);
    res.set("Content-Disposition", `inline; filename="${key.split("/").pop()}"`);
    res.set("Cache-Control", "private, max-age=3600");

    // Stream the file to the client
    const stream = response.Body;
    stream.pipe(res);
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// File download endpoint
app.get("/api/files/download", async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ success: false, message: "File key is required" });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (response.ContentType) res.set("Content-Type", response.ContentType);
    if (response.ContentLength) res.set("Content-Length", response.ContentLength);
    res.set("Content-Disposition", `attachment; filename="${key.split("/").pop()}"`);

    const stream = response.Body;
    stream.pipe(res);
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Routes
app.use("/api/initiatives", initiativeRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/metrics", metricsRoutes);
app.all('*', function (req, res) {
  res.json({ message: 'Endpoint not found' });
});
// Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
