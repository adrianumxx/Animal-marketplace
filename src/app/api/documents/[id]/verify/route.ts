import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ListingDocument } from "@/lib/models";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    await connectDB();
    const doc = await ListingDocument.findById(id).populate({ path: "seller_id", select: "user_id" }).lean<{
      _id: unknown; verified: boolean; confidence: number | null; ai_notes: string | null; seller_id?: { user_id?: unknown };
    }>();

    if (!doc || (user.role !== "admin" && String(doc.seller_id?.user_id) !== user.userId)) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: String(doc._id),
      verified: !!doc.verified,
      confidence: doc.confidence,
      ai_notes: doc.ai_notes,
      status: doc.verified ? "verified" : "pending",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
