import mongoose from "mongoose";

const { Schema } = mongoose;

const MetricsSchema = new Schema(
  {
    totalSavings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MetricsSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
  }
});

export default mongoose.model("Metrics", MetricsSchema);
