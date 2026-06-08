import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User, SellerProfile } from "@/lib/models";
import { isValidCapabilities } from "@/lib/roles";
import type { Capability } from "@/lib/plans";

function authErr(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : m === "Forbidden" ? 403 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();
    const q = req.nextUrl.searchParams.get("search")?.trim();
    const filter = q ? { email: new RegExp(q, "i") } : {};
    const rows = await User.find(filter)
      .select("email full_name role capabilities account_status created_at")
      .sort({ created_at: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ users: rows.map((u) => ({ ...u, id: String((u as Record<string, unknown>)._id) })) });
  } catch (e) { return authErr(e); }
}

const patchSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i),
  role: z.enum(["user", "admin"]).optional(),
  capabilities: z.array(z.enum(["seller", "shelter", "vet"])).optional(),
  account_status: z.enum(["active", "suspended", "banned"]).optional(),
  seller_tier: z.coerce.number().int().min(0).max(2).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const parsed = await parseJson(req, patchSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { id, role, capabilities, account_status, seller_tier } = parsed;

    if (capabilities && !isValidCapabilities(capabilities as Capability[])) {
      return NextResponse.json({ error: "Invalid capability combination" }, { status: 400 });
    }
    if (id === admin.userId && (role === "user" || account_status === "banned")) {
      return NextResponse.json({ error: "Admins cannot demote or ban themselves" }, { status: 400 });
    }

    await connectDB();
    const set: Record<string, unknown> = {};
    if (role) set.role = role;
    if (capabilities) set.capabilities = capabilities;
    if (account_status) set.account_status = account_status;
    if (Object.keys(set).length) await User.updateOne({ _id: id }, { $set: set });

    if (seller_tier !== undefined) {
      await SellerProfile.updateOne({ user_id: id }, { $set: { tier: seller_tier } });
    }

    const updated = await User.findById(id).select("email full_name role capabilities account_status").lean();
    return NextResponse.json({ user: updated ? { ...updated, id: String((updated as Record<string, unknown>)._id) } : null });
  } catch (e) { return authErr(e); }
}
