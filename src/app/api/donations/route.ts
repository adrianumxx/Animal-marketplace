import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Donation, ShelterProfile } from "@/lib/models";

export const PLATFORM_FEE_RATE = 0.05; // PawTrust takes 5% of each donation

const schema = z.object({
  shelter_id: z.string().regex(/^[a-f0-9]{24}$/i),
  amount: z.number().int().min(100).max(10_000_00), // cents: €1 – €10,000
  donor_name: z.string().trim().max(120).optional(),
  donor_email: z.string().email().optional(),
  message: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "donations", { limit: 20, windowMs: 60_000 });
    if (limited) return limited;

    const parsed = await parseJson(req, schema);
    if (parsed instanceof NextResponse) return parsed;

    await connectDB();
    const shelter = await ShelterProfile.findById(parsed.shelter_id).select("_id donation_enabled").lean<{ _id: unknown; donation_enabled?: boolean }>();
    if (!shelter) return NextResponse.json({ error: "Shelter not found" }, { status: 404 });
    if (shelter.donation_enabled === false) return NextResponse.json({ error: "This shelter is not accepting donations" }, { status: 400 });

    const viewer = await getAuthUser(req);
    const platform_fee = Math.round(parsed.amount * PLATFORM_FEE_RATE);
    const net_amount = parsed.amount - platform_fee;

    const donation = await Donation.create({
      shelter_id: parsed.shelter_id,
      donor_user_id: viewer?.userId ?? null,
      donor_name: parsed.donor_name || "Anonymous",
      donor_email: parsed.donor_email ?? null,
      amount: parsed.amount,
      platform_fee,
      net_amount,
      message: parsed.message ?? null,
      status: "pending", // becomes "paid" once Stripe checkout completes
    });

    // NOTE: real charge is created by the Stripe checkout step (see billing sprint).
    return NextResponse.json({
      donation_id: String(donation._id),
      amount: parsed.amount,
      platform_fee,
      net_amount,
      payment_pending: true,
    }, { status: 201 });
  } catch (err) {
    console.error("donation error", err);
    return NextResponse.json({ error: "Could not process donation" }, { status: 500 });
  }
}
