import type { Capability } from "./plans";

export type Role = "user" | "admin";
export type AccountStatus = "active" | "suspended" | "banned";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export const CAPABILITIES: Capability[] = ["seller", "shelter", "vet"];

// Headline label for badge / dashboard routing — satisfies the spec's role enum.
export type EffectiveRole =
  | "admin"
  | "registered_user"
  | "private_seller"
  | "breeder_free"
  | "breeder_pro"
  | "breeder_elite"
  | "shelter"
  | "veterinarian";

export interface RoleContext {
  role: Role;
  capabilities: Capability[];
  sellerTier?: number; // 0 | 1 | 2
  hasBreederProfile?: boolean;
}

export function effectiveRole(u: RoleContext): EffectiveRole {
  if (u.role === "admin") return "admin";
  if (u.capabilities.includes("seller")) {
    const t = u.sellerTier ?? 0;
    if (t >= 2) return "breeder_elite";
    if (t >= 1) return "breeder_pro";
    return u.hasBreederProfile ? "breeder_free" : "private_seller";
  }
  if (u.capabilities.includes("vet")) return "veterinarian";
  if (u.capabilities.includes("shelter")) return "shelter";
  return "registered_user";
}

export const ROLE_LABELS: Record<EffectiveRole, string> = {
  admin: "Admin",
  registered_user: "Member",
  private_seller: "Private Seller",
  breeder_free: "Breeder",
  breeder_pro: "Breeder Pro",
  breeder_elite: "Breeder Elite",
  shelter: "Shelter / Rescue",
  veterinarian: "Veterinarian",
};

/**
 * Combination rules (V1):
 *  - seller and vet are mutually exclusive (a breeder is not a vet)
 *  - shelter is a free add-on: pairs with seller, with vet, or stands alone
 */
export function isValidCapabilities(caps: Capability[]): boolean {
  if (caps.some((c) => !CAPABILITIES.includes(c))) return false;
  if (new Set(caps).size !== caps.length) return false; // no duplicates
  const set = new Set(caps);
  if (set.has("seller") && set.has("vet")) return false;
  return true;
}

export function canAddCapability(current: Capability[], next: Capability): boolean {
  if (current.includes(next)) return false;
  return isValidCapabilities([...current, next]);
}
