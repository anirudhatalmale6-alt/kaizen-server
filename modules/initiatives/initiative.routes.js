import express from "express";
import { upload } from "../../middlewares/upload.js";
import {
  listInitiatives,
  submitInitiative,
  updateInitiativeStatus,
  deleteInitiative
} from "./initiative.controller.js";

const router = express.Router();

router.get("/", listInitiatives);
router.post("/submit", upload.array("files"), submitInitiative);
router.patch("/:id/status", updateInitiativeStatus);
router.delete("/:id", deleteInitiative);

export default router;
