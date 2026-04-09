import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import r2Client from "../../utils/r2.js";

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

const getViewerUrl = (fileUrl, mimeType) => {
    if (
        mimeType.includes("word") ||
        mimeType.includes("excel") ||
        mimeType.includes("spreadsheet") ||
        mimeType.includes("powerpoint") ||
        mimeType.includes("presentation")
    ) {
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    return fileUrl;
};

export const uploadFiles = async (req, res) => {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "No files provided" });
        }

        const uploaded = await Promise.all(
            files.map(async (file) => {
                const fileName = `${Date.now()}-${file.originalname}`;

                await r2Client.send(new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }));

                const url = `${PUBLIC_URL}/${fileName}`;

                return {
                    fileName,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url,
                    viewerUrl: getViewerUrl(url, file.mimetype),
                };
            })
        );

        res.json({ success: true, files: uploaded });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { fileName } = req.params;

        await r2Client.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: fileName,
        }));

        res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};