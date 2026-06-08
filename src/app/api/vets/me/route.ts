import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { VetProfile } from "@/lib/models";

function err(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const profile = await VetProfile.findOne({ user_id: user.userId }).lean<Record<string, unknown>>();
    if (!profile) return NextResponse.json({ error: "No vet profile" }, { status: 404 });
    return NextResponse.json({ profile: { ...profile, id: String(profile._id) } });
  } catch (e) { return err(e); }
}

const putSchema = z.object({
  clinic_name: z.string().trim().max(160).optional(),
  bio_en: z.string().trim().max(3000).optional(),
  location_city: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  website_url: z.string().trim().max(200).optional(),
  services: z.array(z.string().max(60)).max(30).optional(),
  specializations: z.array(z.string().max(60)).max(30).optional(),
  languages: z.array(z.string().max(20)).max(10).optional(),
  telemedicine: z.boolean().optional(),
  accepts_new_patients: z.boolean().optional(),
  avatar_url: z.string().trim().max(400).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const parsed = await parseJson(req, putSchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    const profile = await VetProfile.findOne({ user_id: user.userId });
    if (!profile) return NextResponse.json({ error: "No vet profile" }, { status: 404 });

    for (const k of ["clinic_name", "location_city", "phone", "website_url", "services", "specializations", "languages", "telemedicine", "accepts_new_patients", "avatar_url"] as const) {
      if (parsed[k] !== undefined) (profile as Record<string, unknown>)[k] = parsed[k];
    }
    if (parsed.bio_en !== undefined) profile.bio = { ...(profile.bio ?? {}), en: parsed.bio_en };
    await profile.save();
    return NextResponse.json({ success: true });
  } catch (e) { return err(e); }
}
