import express from "express";
import multer from "multer";
import { uploadFiles, deleteFile } from "./upload.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max per file
});

router.post("/", upload.array("files", 10), uploadFiles); // up to 10 files
router.delete("/:fileName", deleteFile);

export default router;