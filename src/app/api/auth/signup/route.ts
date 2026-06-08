import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { connectDB } from "@/lib/mongodb";
import { User, SellerProfile, VetProfile, ShelterProfile } from "@/lib/models";
import { signToken, SESSION_COOKIE } from "@/lib/jwt";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const signupSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(256),
  full_name: z.string().trim().max(120).optional().default(""),
  role: z.enum(["buyer", "seller", "vet", "shelter"]).optional().default("buyer"),
  business_name: z.string().trim().max(160).optional().default(""),
  country: z.string().trim().min(2).max(3).optional().default("BE"),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "auth:signup", { limit: 5, windowMs: 60_000 });
    if (limited) return limited;

    const parsed = await parseJson(req, signupSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { email, password, full_name, role, business_name, country } = parsed;

    await connectDB();

    const existing = await User.findOne({ email }).lean();
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    // `role` from the form is the signup INTENT; map it to the capability model.
    const capabilities = role === "seller" ? ["seller"] : role === "vet" ? ["vet"] : role === "shelter" ? ["shelter"] : [];
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash, full_name: full_name || null, role: "user", capabilities });
    const userId = String(user._id);

    let sellerId: string | null = null;
    const name = business_name || full_name || email.split("@")[0];
    const slug = `${slugify(name)}-${userId.slice(-6)}`;

    if (role === "seller") {
      const seller = await SellerProfile.create({
        user_id: user._id,
        business_name: name,
        slug,
        location_country: country,
        tier: 0,
        has_breeder_profile: true,
        verification_status: "verified",
        verified_at: new Date(),
      });
      sellerId = String(seller._id);
    }

    if (role === "vet") {
      await VetProfile.create({
        user_id: user._id,
        business_name: name,
        clinic_name: name,
        slug,
        location_country: country,
        verification_status: "verified",
      });
    }

    if (role === "shelter") {
      await ShelterProfile.create({
        user_id: user._id,
        organization_name: name,
        slug,
        location_country: country,
        verification_status: "verified",
        adoption_enabled: true,
        donation_enabled: true,
      });
    }

    const token = signToken({ userId, email, role: "user" });
    const res = NextResponse.json({
      token,
      user: { id: userId, email, full_name: full_name || null, role: "user", capabilities },
      seller_id: sellerId,
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
