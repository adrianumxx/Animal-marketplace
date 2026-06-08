import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { isPaidTier, tierLabel } from "@/lib/plans";

const schema = z.object({ tier: z.coerce.number().int().min(1).max(2) });

// Paid upgrades are placeholders until the billing sprint. We never change the tier here.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const parsed = await parseJson(req, schema);
    if (parsed instanceof NextResponse) return parsed;
    const { tier } = parsed;

    if (!auth.capabilities.includes("seller")) {
      return NextResponse.json({ error: "Only sellers can upgrade their plan" }, { status: 403 });
    }
    if (!isPaidTier("seller", tier)) {
      return NextResponse.json({ error: "Not a paid tier" }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      placeholder: true,
      requested_tier: tier,
      message: `Upgrade to Breeder ${tierLabel("seller", tier)} will be available when billing goes live.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
