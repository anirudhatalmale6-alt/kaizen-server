import { z } from "zod";

export const castVoteSchema = z.object({
  initiativeId: z.string().min(1),
  adminId: z.number().int().min(1).max(5),
  score: z.number().int().min(1).max(5),
});
