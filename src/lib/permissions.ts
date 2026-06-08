import type { Capability } from "./plans";
import type { Role } from "./roles";

// Centralized permission vocabulary. Single source for UI (hide) AND API (enforce).
export type Action =
  | "view_public_listings"
  | "search"
  | "save_listings"
  | "compare"
  | "contact_users"
  | "report"
  | "start_safe_deal"
  | "apply_to_adopt"
  | "donate"
  | "leave_review"
  | "create_sale_listing"
  | "create_adoption_listing"
  | "upload_documents"
  | "submit_for_verification"
  | "receive_safe_deal"
  | "receive_adoption_requests"
  | "receive_donations"
  | "create_shelter_campaign"
  | "create_breeder_profile"
  | "create_vet_profile"
  | "use_booking_button"
  | "basic_analytics"
  | "advanced_analytics"
  | "use_boosts"
  | "access_admin"
  | "manage_roles";

export interface PermissionContext {
  authenticated: boolean;
  role: Role | string;          // tolerate legacy role strings pre-migration
  capabilities: Capability[];
  sellerTier?: number;          // 0|1|2
  hasBreederProfile?: boolean;
  sellerVerified?: boolean;     // default true (V1 auto-verify)
  shelterVerified?: boolean;
  vetVerified?: boolean;
  // Reviews are only allowed after a real completed transaction (Safe Deal sprint).
  hasCompletedTransaction?: boolean;
}

const has = (ctx: PermissionContext, cap: Capability) => ctx.capabilities.includes(cap);

export function can(ctx: PermissionContext, action: Action): boolean {
  if (ctx.role === "admin") return true;

  // Public floor — available to everyone, even unauthenticated.
  if (action === "view_public_listings" || action === "search") return true;

  // Everything below requires a session.
  if (!ctx.authenticated) return false;

  const tier = ctx.sellerTier ?? 0;
  const sellerVerified = ctx.sellerVerified ?? true;
  const shelterVerified = ctx.shelterVerified ?? true;

  switch (action) {
    // Registered floor (any logged-in user behaves as buyer/donor)
    case "save_listings":
    case "compare":
    case "contact_users":
    case "report":
    case "start_safe_deal":
    case "apply_to_adopt":
    case "donate":
      return true;
    case "leave_review":
      return Boolean(ctx.hasCompletedTransaction);

    // Seller capability
    case "create_sale_listing":
      return has(ctx, "seller") && sellerVerified;
    case "upload_documents":
    case "submit_for_verification":
    case "receive_safe_deal":
    case "create_breeder_profile":
      return has(ctx, "seller");
    case "basic_analytics":
      return has(ctx, "seller") || has(ctx, "shelter") || has(ctx, "vet");
    case "use_boosts":
      return has(ctx, "seller") && tier >= 1;
    case "advanced_analytics":
      return has(ctx, "seller") && tier >= 2;

    // Shelter capability (no sale listing / Buy Now)
    case "create_adoption_listing":
    case "receive_adoption_requests":
      return has(ctx, "shelter") && shelterVerified;
    case "receive_donations":
    case "create_shelter_campaign":
      return has(ctx, "shelter");

    // Vet capability (single free tier in V1)
    case "create_vet_profile":
      return has(ctx, "vet");
    case "use_booking_button":
      return false; // Vet Pro removed in V1; re-enable when vet[1] returns

    // Admin-only
    case "access_admin":
    case "manage_roles":
      return false;

    default:
      return false;
  }
}

export function canAll(ctx: PermissionContext, actions: Action[]): boolean {
  return actions.every((a) => can(ctx, a));
}
