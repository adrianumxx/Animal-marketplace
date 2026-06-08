import { test } from "node:test";
import assert from "node:assert/strict";
import { can, type PermissionContext } from "../src/lib/permissions.ts";

const ctx = (over: Partial<PermissionContext> = {}): PermissionContext => ({
  authenticated: true,
  role: "user",
  capabilities: [],
  ...over,
});

test("public visitor: read-only, no actions", () => {
  const v = ctx({ authenticated: false });
  assert.equal(can(v, "view_public_listings"), true);
  assert.equal(can(v, "search"), true);
  assert.equal(can(v, "save_listings"), false);
  assert.equal(can(v, "contact_users"), false);
});

test("registered user: buyer/donor floor, no selling", () => {
  const u = ctx();
  assert.equal(can(u, "save_listings"), true);
  assert.equal(can(u, "contact_users"), true);
  assert.equal(can(u, "donate"), true);
  assert.equal(can(u, "apply_to_adopt"), true);
  assert.equal(can(u, "create_sale_listing"), false);
  assert.equal(can(u, "leave_review"), false); // no transaction yet
  assert.equal(can(u, "access_admin"), false);
});

test("review unlocks only with completed transaction", () => {
  assert.equal(can(ctx({ hasCompletedTransaction: true }), "leave_review"), true);
});

test("seller verified tier 0", () => {
  const s = ctx({ capabilities: ["seller"], sellerTier: 0, sellerVerified: true });
  assert.equal(can(s, "create_sale_listing"), true);
  assert.equal(can(s, "use_boosts"), false);
  assert.equal(can(s, "advanced_analytics"), false);
  assert.equal(can(s, "basic_analytics"), true);
  assert.equal(can(s, "create_adoption_listing"), false);
});

test("seller unverified cannot publish", () => {
  const s = ctx({ capabilities: ["seller"], sellerVerified: false });
  assert.equal(can(s, "create_sale_listing"), false);
});

test("breeder pro (tier 1) gets boosts, not advanced analytics", () => {
  const s = ctx({ capabilities: ["seller"], sellerTier: 1 });
  assert.equal(can(s, "use_boosts"), true);
  assert.equal(can(s, "advanced_analytics"), false);
});

test("breeder elite (tier 2) gets advanced analytics", () => {
  const s = ctx({ capabilities: ["seller"], sellerTier: 2 });
  assert.equal(can(s, "advanced_analytics"), true);
  assert.equal(can(s, "use_boosts"), true);
});

test("shelter: adoption + donations, never sale", () => {
  const sh = ctx({ capabilities: ["shelter"], shelterVerified: true });
  assert.equal(can(sh, "create_adoption_listing"), true);
  assert.equal(can(sh, "receive_donations"), true);
  assert.equal(can(sh, "receive_adoption_requests"), true);
  assert.equal(can(sh, "create_sale_listing"), false);
});

test("vet: profile + directory, no selling, no booking in V1", () => {
  const vt = ctx({ capabilities: ["vet"] });
  assert.equal(can(vt, "create_vet_profile"), true);
  assert.equal(can(vt, "basic_analytics"), true);
  assert.equal(can(vt, "use_booking_button"), false);
  assert.equal(can(vt, "create_sale_listing"), false);
});

test("vet + shelter combo unions permissions", () => {
  const vs = ctx({ capabilities: ["vet", "shelter"], shelterVerified: true });
  assert.equal(can(vs, "create_vet_profile"), true);
  assert.equal(can(vs, "create_adoption_listing"), true);
  assert.equal(can(vs, "create_sale_listing"), false);
});

test("admin can do everything", () => {
  const a = ctx({ role: "admin" });
  assert.equal(can(a, "access_admin"), true);
  assert.equal(can(a, "manage_roles"), true);
  assert.equal(can(a, "create_sale_listing"), true);
  assert.equal(can(a, "advanced_analytics"), true);
});
