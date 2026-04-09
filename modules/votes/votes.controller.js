import Initiative from "../initiatives/initiative.model.js";
import { castVoteSchema } from "./votes.validators.js";

export async function castVote(req, res) {
  const parsed = castVoteSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(e => e.message).join(", ");
    return res.status(400).json({
      success: false,
      message: errorMessages
    });
  }

  const { initiativeId, adminId, score } = parsed.data;

  const initiative = await Initiative.findById(initiativeId);
  if (!initiative) {
    return res.status(404).json({
      success: false,
      message: "Initiative not found"
    });
  }

  const existing = initiative.votes.find(v => v.adminId === adminId);

  if (existing) {
    existing.score = score;
    existing.votedAt = new Date();
  } else {
    initiative.votes.push({
      adminId,
      score,
      votedAt: new Date()
    });
  }

  await initiative.save();

  return res.status(201).json({
    success: true,
    data: initiative.toJSON()
  });
}
