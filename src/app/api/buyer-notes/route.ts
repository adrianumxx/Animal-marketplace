import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireSeller } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { BuyerNote } from "@/lib/models";

const createSchema = z.object({
  buyer_email: z.string().email().trim().toLowerCase().optional().nullable(),
  buyer_user_id: z.string().regex(/^[a-f0-9]{24}$/i).optional().nullable(),
  body: z.string().trim().min(1).max(4000),
});

function err(e: unknown) {
  const msg = e instanceof Error ? e.message : "Error";
  const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireSeller(req);
    const email = req.nextUrl.searchParams.get("buyer_email");
    const buyerId = req.nextUrl.searchParams.get("buyer_user_id");
    if (!email && !buyerId) return NextResponse.json({ error: "buyer_email or buyer_user_id required" }, { status: 400 });

    await connectDB();
    const filter: Record<string, unknown> = { author_id: user.userId };
    if (email) filter.buyer_email = email.toLowerCase();
    if (buyerId && /^[a-f0-9]{24}$/i.test(buyerId)) filter.buyer_user_id = buyerId;

    const rows = await BuyerNote.find(filter).sort({ created_at: -1 }).lean();
    return NextResponse.json({ notes: rows.map((r) => ({ ...r, id: String((r as Record<string, unknown>)._id) })) });
  } catch (e) { return err(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSeller(req);
    const parsed = await parseJson(req, createSchema);
    if (parsed instanceof NextResponse) return parsed;
    if (!parsed.buyer_email && !parsed.buyer_user_id) {
      return NextResponse.json({ error: "buyer_email or buyer_user_id required" }, { status: 400 });
    }
    await connectDB();
    const note = await BuyerNote.create({
      author_id: user.userId,
      buyer_email: parsed.buyer_email ?? null,
      buyer_user_id: parsed.buyer_user_id ?? null,
      body: parsed.body,
    });
    return NextResponse.json({ note: { ...note.toObject(), id: String(note._id) } }, { status: 201 });
  } catch (e) { return err(e); }
}
