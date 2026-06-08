import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User, SellerProfile } from "@/lib/models";
import { effectiveRole } from "@/lib/roles";
import type { Capability } from "@/lib/plans";

export async function PATCH(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const set: Record<string, unknown> = {};
  if (typeof body.full_name === "string") set.full_name = body.full_name.slice(0, 120);
  if (typeof body.avatar_url === "string") set.avatar_url = body.avatar_url.slice(0, 400);
  if (Object.keys(set).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  await connectDB();
  await User.updateOne({ _id: payload.userId }, { $set: set });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("email full_name role capabilities avatar_url created_at")
    .lean<{ _id: unknown; email: string; full_name: string | null; role: string; capabilities?: string[]; avatar_url?: string | null; created_at: Date }>();

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const capabilities = (user.capabilities ?? []) as Capability[];
  const legacy = [...capabilities];
  if (user.role === "seller" && !legacy.includes("seller")) legacy.push("seller");
  if (user.role === "vet" && !legacy.includes("vet")) legacy.push("vet");

  let seller_id: string | null = null;
  let sellerTier = 0;
  let hasBreederProfile = false;
  if (legacy.includes("seller")) {
    const sp = await SellerProfile.findOne({ user_id: user._id }).select("_id tier has_breeder_profile").lean<{ _id: unknown; tier?: number; has_breeder_profile?: boolean }>();
    if (sp) { seller_id = String(sp._id); sellerTier = sp.tier ?? 0; hasBreederProfile = sp.has_breeder_profile ?? false; }
  }

  const effective_role = effectiveRole({ role: user.role === "admin" ? "admin" : "user", capabilities: legacy, sellerTier, hasBreederProfile });

  return NextResponse.json({
    id: String(user._id),
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    capabilities,
    effective_role,
    seller_tier: sellerTier,
    avatar_url: user.avatar_url ?? null,
    created_at: user.created_at,
    seller_id,
  });
}
