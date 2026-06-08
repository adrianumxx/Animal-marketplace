import { v2 as cloudinary } from "cloudinary";

export function hasCloudinary(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_API_KEY.includes("your-")
  );
}

let configured = false;
function ensureConfig() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export interface UploadResult {
  url: string;
  public_id: string;
}

/** Upload a file buffer to Cloudinary. `resourceType`: "image" for photos, "raw"/"auto" for PDFs. */
export function uploadBuffer(
  buffer: Buffer,
  opts: { folder: string; resourceType?: "image" | "raw" | "auto" } = { folder: "pawtrust" }
): Promise<UploadResult> {
  ensureConfig();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: opts.folder, resource_type: opts.resourceType ?? "image" },
      (err, res) => {
        if (err || !res) return reject(err ?? new Error("Upload failed"));
        resolve({ url: res.secure_url, public_id: res.public_id });
      }
    );
    stream.end(buffer);
  });
}
