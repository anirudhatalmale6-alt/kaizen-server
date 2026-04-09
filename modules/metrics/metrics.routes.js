import express from "express";
import { getMetrics, updateMetrics } from "./metrics.controller.js";

const router = express.Router();

router.get("/", getMetrics);
router.patch("/", updateMetrics);

export default router;