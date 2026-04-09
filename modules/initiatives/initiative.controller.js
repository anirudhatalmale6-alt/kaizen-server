import Initiative from "./initiative.model.js";
import { createInitiativeSchema, updateStatusSchema } from "./initiative.validators.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import r2Client from "../../utils/r2.js";
import { makeSlug } from '../../utils/slug.js';

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

export async function listInitiatives(_req, res) {
  const initiatives = await Initiative.find().sort({ dateSubmitted: -1 });
  const initArray = initiatives.map(d => {
    return {
      ...d.toJSON(),
      id: d._id.toString(),
    };
  });
  const implemented = initArray.filter(i => i.status === "Implemented").length;
  const reviewed = initArray.filter(i => i.status === "Reviewed").length;
  const pending = initArray.filter(i => i.status === "Pending").length;

  return res.json({
    success: true,
    implemented,
    reviewed,
    pending,
    data: initArray
  });
}

export async function submitInitiative(req, res) {

  const parsed = createInitiativeSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(e => e.message).join(", ");
    return res.status(400).json({
      success: false,
      message: errorMessages
    });
  }

  const files = req.files || [];
  const slug = makeSlug(parsed.data.title, parsed.data.fullName);

  const attachments = await Promise.all(
    files.map(async (f) => {
      const fileName = `${slug}/${Date.now()}-${f.originalname}`;

      await r2Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: f.buffer,
        ContentType: f.mimetype,
      }));

      const url = `${PUBLIC_URL}/${fileName}`;

      return {
        fileName,
        fileType: f.mimetype,
        fileSize: f.size,
        url,
      };
    })
  );

  const doc = await Initiative.create({
    ...parsed.data,
    attachments,
    votes: [],
    status: "Pending",
    dateSubmitted: new Date()
  });

  return res.status(201).json({
    success: true,
    message: "Initiative submitted successfully"
  });
}

export async function updateInitiativeStatus(req, res) {
  const { id } = req.params;

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(e => e.message).join(", ");
    return res.status(400).json({
      success: false,
      message: errorMessages
    });
  }

  const updated = await Initiative.findByIdAndUpdate(
    id,
    { $set: { status: parsed.data.status } },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Initiative not found"
    });
  }

  return res.json({
    success: true,
    data: updated.toJSON()
  });
}

export async function deleteInitiative(req, res) {
  const { id } = req.params;

  const deleted = await Initiative.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Initiative not found"
    });
  }

  return res.json({
    success: true,
    data: { id }
  });
}