import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { connectDB } from "@/lib/mongodb";
import { User, SellerProfile } from "@/lib/models";
import { signToken, SESSION_COOKIE } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1).max(256),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "auth:login", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const parsed = await parseJson(req, loginSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { email, password } = parsed;

    await connectDB();

    const user = await User.findOne({ email }).select("+password_hash");
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    if (user.account_status === "banned" || user.account_status === "suspended") {
      return NextResponse.json({ error: "This account has been suspended. Contact support." }, { status: 403 });
    }

    const userId = String(user._id);
    const capabilities: string[] = user.capabilities ?? [];
    let sellerId: string | null = null;
    if (capabilities.includes("seller") || user.role === "seller") {
      const seller = await SellerProfile.findOne({ user_id: user._id }).select("_id").lean<{ _id: unknown }>();
      sellerId = seller ? String(seller._id) : null;
    }

    const token = signToken({ userId, email: user.email, role: user.role });
    const res = NextResponse.json({
      token,
      user: { id: userId, email: user.email, full_name: user.full_name, role: user.role, capabilities },
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
    console.error("login error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
