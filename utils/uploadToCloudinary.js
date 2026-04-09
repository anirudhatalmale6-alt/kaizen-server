import cloudinary from "../config/cloudinary.js";

export async function uploadBuffer(
  buffer,
  originalName,
  folder = "kaizen"
) {
  const safeBaseName = originalName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.[^/.]+$/, "")
    .toLowerCase();
  const uniqueSuffix = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${safeBaseName}_${uniqueSuffix}`,
        use_filename: true,
        unique_filename: false,
        access_mode : "public"
      },
      (error, result) => {
        if (error || !result) return reject(error);

        resolve({
          secure_url: result.secure_url,
          bytes: result.bytes,
          fileName: originalName,
          cloudinaryId: result.public_id
        });
      }
    );

    stream.end(buffer);
  });
}
