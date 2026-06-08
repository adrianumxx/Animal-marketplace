import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SavedSearch } from "@/lib/models";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  params: z.record(z.string(), z.string()).default({}),
  alert: z.boolean().optional().default(false),
});

function err(e: unknown) {
  const msg = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const rows = await SavedSearch.find({ user_id: user.userId }).sort({ created_at: -1 }).lean();
    return NextResponse.json({ saved_searches: rows.map((r) => ({ ...r, id: String((r as Record<string, unknown>)._id) })) });
  } catch (e) { return err(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const parsed = await parseJson(req, createSchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    const doc = await SavedSearch.create({ user_id: user.userId, name: parsed.name, params: parsed.params, alert: parsed.alert });
    return NextResponse.json({ saved_search: { ...doc.toObject(), id: String(doc._id) } }, { status: 201 });
  } catch (e) { return err(e); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "id required" }, { status: 400 });
    await connectDB();
    await SavedSearch.deleteOne({ _id: id, user_id: user.userId });
    return NextResponse.json({ success: true });
  } catch (e) { return err(e); }
}
