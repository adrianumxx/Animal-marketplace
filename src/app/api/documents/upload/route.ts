import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SellerProfile, Listing, ListingDocument } from "@/lib/models";
import { hasCloudinary, uploadBuffer } from "@/lib/cloudinary";

const oid = z.string().regex(/^[a-f0-9]{24}$/i);
const uploadSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: z.string().trim().max(80).optional().default("other"),
  listing_id: oid.optional().nullable(),
  file_base64: z.string().min(32).max(12_000_000),
});

function decodeMime(input: string) {
  const match = input.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match?.[1] ?? "application/pdf";
  const payload = match?.[2] ?? input;
  return { bytes: Buffer.from(payload, "base64"), mimeType };
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "documents:upload", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const seller = await SellerProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>();
    if (!seller) return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });

    const parsed = await parseJson(req, uploadSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { name, type, listing_id, file_base64 } = parsed;

    if (listing_id) {
      const owned = await Listing.findOne({ _id: listing_id, seller_id: seller._id }).select("_id").lean();
      if (!owned) return NextResponse.json({ error: "Listing not found or forbidden" }, { status: 403 });
    }

    const { bytes, mimeType } = decodeMime(file_base64);
    if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return NextResponse.json({ error: "Unsupported document type" }, { status: 400 });
    }
    if (bytes.length > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Document exceeds 8MB limit" }, { status: 400 });
    }

    let fileUrl: string | null = null;
    if (hasCloudinary()) {
      const result = await uploadBuffer(bytes, { folder: "pawtrust/documents", resourceType: "auto" });
      fileUrl = result.url;
    }

    const created = await ListingDocument.create({
      seller_id: seller._id,
      listing_id: listing_id || null,
      name,
      type,
      mime_type: mimeType,
      url: fileUrl,
      verified: false,
    });

    const document = {
      id: String(created._id),
      name,
      type,
      url: fileUrl,
      verified: false,
      confidence: null,
      ai_notes: null,
      status: "pending",
      created_at: created.created_at,
    };

    if (listing_id) {
      await Listing.updateOne({ _id: listing_id }, { $push: { documents: document } });
    }

    return NextResponse.json({ document, message: "Document uploaded. Verification pending." }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
