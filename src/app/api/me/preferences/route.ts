import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";

const prefSchema = z.object({
  species: z.array(z.string().max(40)).max(20).optional(),
  breeds: z.array(z.string().max(60)).max(40).optional(),
  budget_max: z.coerce.number().int().min(0).max(100_000_000).nullable().optional(),
  locations: z.array(z.string().max(60)).max(20).optional(),
});

const empty = { species: [], breeds: [], budget_max: null, locations: [] };

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const u = await User.findById(user.userId).select("preferences").lean<{ preferences?: typeof empty }>();
    return NextResponse.json({ preferences: u?.preferences ?? empty });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const parsed = await parseJson(req, prefSchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    const current = await User.findById(user.userId).select("preferences").lean<{ preferences?: typeof empty }>();
    const merged = {
      species: parsed.species ?? current?.preferences?.species ?? [],
      breeds: parsed.breeds ?? current?.preferences?.breeds ?? [],
      budget_max: parsed.budget_max !== undefined ? parsed.budget_max : current?.preferences?.budget_max ?? null,
      locations: parsed.locations ?? current?.preferences?.locations ?? [],
    };
    await User.updateOne({ _id: user.userId }, { $set: { preferences: merged } });
    return NextResponse.json({ preferences: merged });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
