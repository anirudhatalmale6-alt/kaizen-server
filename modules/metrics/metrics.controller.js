import Metrics from "./metrics.model.js";
import { z } from "zod";

const updateSchema = z.object({
  totalSavings: z.number().nonnegative()
});

async function getMetricsDoc() {
  let doc = await Metrics.findOne();
  if (!doc) {
    doc = await Metrics.create({ totalSavings: 0 });
  }
  return doc;
}

// GET /metrics
export async function getMetrics(_req, res) {
  const doc = await getMetricsDoc();
  res.json({
    success: true,
    totalSavings: doc.totalSavings
  });
}

// PATCH /metrics
export async function updateMetrics(req, res) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "totalSavings must be a non-negative number"
    });
  }

  const doc = await getMetricsDoc();
  doc.totalSavings = parsed.data.totalSavings;
  await doc.save();

  res.json({
    success: true,
    totalSavings: doc.totalSavings
  });
}