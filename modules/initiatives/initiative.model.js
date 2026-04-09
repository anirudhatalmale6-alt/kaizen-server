import mongoose from "mongoose";

const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const VoteSchema = new Schema(
  {
    adminId: { type: Number, required: true, min: 1, max: 5 },
    score: { type: Number, required: true, min: 1, max: 5 },
    votedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const InitiativeSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true },

    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Implemented"],
      default: "Pending"
    },

    dateSubmitted: { type: Date, default: Date.now },
    attachments: { type: [AttachmentSchema], default: [] },
    votes: { type: [VoteSchema], default: [] }
  },
  { timestamps: true }
);

InitiativeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
  }
});

export default mongoose.model("Initiative", InitiativeSchema);
