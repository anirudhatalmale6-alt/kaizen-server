import express from "express";
import { castVote } from "./votes.controller.js";

const router = express.Router();
router.post("/", castVote);
export default router;

