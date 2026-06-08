// Idempotent migration: legacy users (role buyer/seller/vet) → v1 role model.
// Safe to run multiple times. Run: node scripts/migrate-roles.mjs
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const env = Object.fromEntries(
  fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const opts = { strict: false };
const User = mongoose.model("User", new mongoose.Schema({}, opts));
const SellerProfile = mongoose.model("SellerProfile", new mongoose.Schema({}, opts));

const BADGE_TIER = { basic: 0, pro: 1, premium: 2 };

async function run() {
  await mongoose.connect(env.MONGODB_URI, { dbName: "pawtrust" });
  const users = await User.find({ role: { $in: ["buyer", "seller", "vet"] } });
  let migrated = 0;

  for (const u of users) {
    const caps = Array.isArray(u.capabilities) ? [...u.capabilities] : [];
    if (u.role === "seller" && !caps.includes("seller")) caps.push("seller");
    if (u.role === "vet" && !caps.includes("vet")) caps.push("vet");

    u.capabilities = caps;
    u.role = "user";                 // buyer/seller/vet → user (admin untouched, not in query)
    u.account_status = u.account_status || "active";
    await u.save();

    if (caps.includes("seller")) {
      const sp = await SellerProfile.findOne({ user_id: u._id });
      if (sp) {
        sp.tier = sp.tier ?? (BADGE_TIER[sp.badge_level] ?? 0);
        sp.has_breeder_profile = sp.has_breeder_profile ?? true;
        sp.verification_status = sp.verification_status || "verified";
        await sp.save();
      }
    }
    migrated++;
  }

  console.log(`Migrated ${migrated} legacy user(s).`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
