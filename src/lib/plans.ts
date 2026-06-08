// Static plan/pricing config — SINGLE SOURCE. Never copy pricing onto user docs.
// Tiers are numeric; labels are per-capability.

export type Capability = "seller" | "shelter" | "vet";

export interface SellerPlan {
  monthly: number;
  sd_fee: number;   // Safe Deal fee %
  min_fee: number;  // minimum Safe Deal fee (EUR)
  boosts: number;   // monthly boosts included
}
export interface ShelterPlan {
  monthly: number;
  listing_fee: number;
  adoption_fee: number;
  donation_fee: number;
  tip: boolean;
}
export interface VetPlan {
  monthly: number;
}

export const PLANS = {
  seller: [
    { monthly: 0, sd_fee: 15, min_fee: 49, boosts: 0 }, // tier 0 — private seller / breeder free
    { monthly: 49, sd_fee: 7, min_fee: 39, boosts: 1 }, // tier 1 — breeder pro
    { monthly: 99, sd_fee: 5, min_fee: 29, boosts: 3 }, // tier 2 — breeder elite
  ] as SellerPlan[],
  shelter: [
    { monthly: 0, listing_fee: 0, adoption_fee: 0, donation_fee: 0, tip: true },
  ] as ShelterPlan[],
  vet: [
    { monthly: 0 }, // single free tier in V1 (Vet Pro removed; re-add as vet[1] later)
  ] as VetPlan[],
} as const;

export const MAX_TIER: Record<Capability, number> = { seller: 2, shelter: 0, vet: 0 };

const clampTier = (cap: Capability, tier: number) => Math.max(0, Math.min(tier, MAX_TIER[cap]));

export function sellerPlan(tier: number): SellerPlan {
  return PLANS.seller[clampTier("seller", tier)];
}

export function boostsIncluded(tier: number): number {
  return sellerPlan(tier).boosts;
}

const SELLER_LABELS = ["Free", "Pro", "Elite"];

export function tierLabel(cap: Capability, tier: number): string {
  if (cap === "seller") return SELLER_LABELS[clampTier("seller", tier)];
  if (cap === "vet") return "Basic";
  return "Standard";
}

// Whether a tier is a paid upgrade (used to gate self-serve vs billing-placeholder).
export function isPaidTier(cap: Capability, tier: number): boolean {
  if (cap !== "seller") return false;
  return clampTier("seller", tier) >= 1;
}
