import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import { User, SellerProfile, ShelterProfile, VetProfile } from "@/lib/models";
import type { Capability } from "@/lib/plans";
import { can, type Action, type PermissionContext } from "@/lib/permissions";

/** Resolved user — role/capabilities read FRESH from DB (not trusted from the token). */
export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  capabilities: Capability[];
  account_status: string;
}

export type JwtPayload = AuthUser; // back-compat alias

async function extractToken(req?: NextRequest): Promise<string | null> {
  const auth = req?.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const store = req ? req.cookies : await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/** Verify the token, then load the user from the DB so role/caps are always current. */
export async function getAuthUser(req?: NextRequest): Promise<AuthUser | null> {
  const token = await extractToken(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const u = await User.findById(payload.userId)
    .select("email role capabilities account_status")
    .lean<{ _id: unknown; email: string; role: string; capabilities?: Capability[]; account_status?: string }>();
  if (!u) return null;
  if (u.account_status === "banned" || u.account_status === "suspended") return null;

  return {
    userId: String(u._id),
    email: u.email,
    role: u.role,
    capabilities: u.capabilities ?? [],
    account_status: u.account_status ?? "active",
  };
}

export async function requireAuth(req?: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}

/** Capability-aware (bridges legacy role 'seller' and new capabilities[] during migration). */
export async function requireSeller(req?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(req);
  const ok = user.role === "admin" || user.role === "seller" || user.capabilities.includes("seller");
  if (!ok) throw new Error("Forbidden");
  return user;
}

export async function requireAdmin(req?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(req);
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}

/** Build the full PermissionContext (loads profiles for tier/verification state). */
export async function getPermissionContext(req?: NextRequest): Promise<PermissionContext> {
  const user = await getAuthUser(req);
  if (!user) {
    return { authenticated: false, role: "user", capabilities: [] };
  }
  // Bridge legacy roles (seller/vet) to capabilities until Phase 4 migration runs.
  const caps: Capability[] = [...user.capabilities];
  if (user.role === "seller" && !caps.includes("seller")) caps.push("seller");
  if (user.role === "vet" && !caps.includes("vet")) caps.push("vet");

  await connectDB();
  const [seller, shelter, vet] = await Promise.all([
    caps.includes("seller")
      ? SellerProfile.findOne({ user_id: user.userId }).select("tier has_breeder_profile verification_status").lean<{ tier?: number; has_breeder_profile?: boolean; verification_status?: string }>()
      : null,
    caps.includes("shelter")
      ? ShelterProfile.findOne({ user_id: user.userId }).select("verification_status").lean<{ verification_status?: string }>()
      : null,
    caps.includes("vet")
      ? VetProfile.findOne({ user_id: user.userId }).select("verification_status").lean<{ verification_status?: string }>()
      : null,
  ]);

  return {
    authenticated: true,
    role: user.role,
    capabilities: caps,
    sellerTier: seller?.tier ?? 0,
    hasBreederProfile: seller?.has_breeder_profile ?? false,
    sellerVerified: (seller?.verification_status ?? "verified") === "verified",
    shelterVerified: (shelter?.verification_status ?? "verified") === "verified",
    vetVerified: (vet?.verification_status ?? "verified") === "verified",
    hasCompletedTransaction: false, // Safe Deal sprint will wire this
  };
}

/** Server-side enforcement: throws Forbidden/Unauthorized if the action isn't allowed. */
export async function requirePermission(action: Action, req?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(req);
  const ctx = await getPermissionContext(req);
  if (!can(ctx, action)) throw new Error("Forbidden");
  return user;
}
