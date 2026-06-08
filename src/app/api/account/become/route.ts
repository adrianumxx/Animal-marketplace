import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User, SellerProfile, ShelterProfile, VetProfile } from "@/lib/models";
import { canAddCapability } from "@/lib/roles";
import type { Capability } from "@/lib/plans";

const schema = z.object({
  capability: z.enum(["seller", "shelter", "vet"]),
  breeder: z.boolean().optional().default(false), // seller-only: create a public breeder profile
  business_name: z.string().trim().max(160).optional().default(""),
  country: z.string().trim().min(2).max(3).optional().default("BE"),
});

const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "account:become", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const auth = await requireAuth(req);
    const parsed = await parseJson(req, schema);
    if (parsed instanceof NextResponse) return parsed;
    const { capability, breeder, business_name, country } = parsed;

    await connectDB();
    const user = await User.findById(auth.userId);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const caps: Capability[] = user.capabilities ?? [];
    if (caps.includes(capability)) return NextResponse.json({ error: "Capability already active" }, { status: 409 });
    if (!canAddCapability(caps, capability)) {
      return NextResponse.json({ error: "This combination is not allowed (seller and vet are mutually exclusive)" }, { status: 400 });
    }

    const name = business_name || user.full_name || user.email.split("@")[0];
    const slug = `${slugify(name)}-${String(user._id).slice(-6)}`;
    let profileId: string | null = null;

    // Self-serve free tiers, auto-verified in V1 (admin queue stays active for review/revoke).
    if (capability === "seller") {
      const existing = await SellerProfile.findOne({ user_id: user._id }).select("_id").lean<{ _id: unknown }>();
      if (!existing) {
        const sp = await SellerProfile.create({
          user_id: user._id, business_name: name, slug, location_country: country,
          tier: 0, has_breeder_profile: breeder, verification_status: "verified", verified_at: new Date(),
        });
        profileId = String(sp._id);
      } else profileId = String(existing._id);
    } else if (capability === "shelter") {
      const sp = await ShelterProfile.create({
        user_id: user._id, organization_name: name, slug, location_country: country, verification_status: "verified",
      });
      profileId = String(sp._id);
    } else {
      const vp = await VetProfile.create({
        user_id: user._id, clinic_name: name, business_name: name, slug, location_country: country, verification_status: "verified",
      });
      profileId = String(vp._id);
    }

    user.capabilities = [...caps, capability];
    await user.save();

    return NextResponse.json({
      success: true,
      capability,
      profile_id: profileId,
      user: { id: String(user._id), role: user.role, capabilities: user.capabilities },
    }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    console.error("become error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
