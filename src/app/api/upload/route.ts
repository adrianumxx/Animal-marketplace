import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { rateLimit } from "@/lib/api-guard";
import { hasCloudinary, uploadBuffer } from "@/lib/cloudinary";

const MAX = 8 * 1024 * 1024; // 8MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "upload", { limit: 30, windowMs: 60_000 });
    if (limited) return limited;

    await requireAuth(req);
    if (!hasCloudinary()) {
      return NextResponse.json({ error: "Image storage not configured. Add Cloudinary keys to .env.local." }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "Image exceeds 8MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, { folder: "pawtrust/listings", resourceType: "image" });
    return NextResponse.json({ url: result.url, public_id: result.public_id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    console.error("upload error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
