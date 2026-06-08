// PawTrust seed — v1 role system. Wipe + repopulate Atlas with one user per effectiveRole.
// Run: npm run seed
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const env = Object.fromEntries(
  fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const URI = env.MONGODB_URI;
if (!URI || URI.includes("<")) { console.error("MONGODB_URI missing in .env.local"); process.exit(1); }

const opts = { strict: false, timestamps: { createdAt: "created_at", updatedAt: false } };
const M = (n) => mongoose.model(n, new mongoose.Schema({}, opts), undefined);
const User = M("User"), Species = M("Species"), Breed = M("Breed");
const SellerProfile = M("SellerProfile"), ShelterProfile = M("ShelterProfile"), VetProfile = M("VetProfile"), Listing = M("Listing"), Review = M("Review");

const oid = () => new mongoose.Types.ObjectId();
const L = (en) => ({ en, fr: en, nl: en });
const hash = (pw) => bcrypt.hashSync(pw, 10);

// Mirror of effectiveRole() for the printout (keep in sync with src/lib/roles.ts)
function effectiveRole(u, tier = 0, hasBreeder = false) {
  if (u.role === "admin") return "admin";
  const c = u.capabilities || [];
  if (c.includes("seller")) return tier >= 2 ? "breeder_elite" : tier >= 1 ? "breeder_pro" : hasBreeder ? "breeder_free" : "private_seller";
  if (c.includes("vet")) return "veterinarian";
  if (c.includes("shelter")) return "shelter";
  return "registered_user";
}

async function run() {
  await mongoose.connect(URI, { dbName: "pawtrust" });
  console.log("connected:", mongoose.connection.name);
  await Promise.all([User, Species, Breed, SellerProfile, ShelterProfile, VetProfile, Listing, Review].map((m) => m.deleteMany({})));

  /* ── Users (role: user|admin) + capabilities ── */
  const U = (email, name, role, capabilities, locale = "en") =>
    ({ _id: oid(), email, password_hash: hash(role === "admin" ? "Admin123!" : "Pawtrust123!"), full_name: name, role, capabilities, account_status: "active", locale });

  const admin   = U("admin@pawtrust.eu",        "PawTrust Admin",  "admin", []);
  const member  = U("member@pawtrust.eu",       "Sophie Member",   "user",  []);
  const priv    = U("private@pawtrust.eu",      "Paul Private",    "user",  ["seller"]);
  const bFree   = U("breeder@pawtrust.eu",      "Bea Breeder",     "user",  ["seller"]);
  const bPro    = U("breederpro@pawtrust.eu",   "Thomas Vermeer",  "user",  ["seller"], "nl");
  const bElite  = U("elite@pawtrust.eu",        "Marc Dubois",     "user",  ["seller"]);
  const shelter = U("shelter@pawtrust.eu",      "Happy Paws Rescue","user", ["shelter"]);
  const vet     = U("vet@pawtrust.eu",          "Dr. Anne Mertens","user",  ["vet"], "fr");
  const vetShel = U("vetshelter@pawtrust.eu",   "Dr. Luc + Refuge","user",  ["vet", "shelter"]);
  const rev1    = U("emma.l@example.com",        "Emma Laurent",    "user",  []);
  const rev2    = U("jan.v@example.com",         "Jan Vermeulen",   "user",  []);
  const rev3    = U("marie.d@example.com",       "Marie Dubois",    "user",  []);
  const users = [admin, member, priv, bFree, bPro, bElite, shelter, vet, vetShel, rev1, rev2, rev3];
  await User.insertMany(users);

  /* ── Seller/Breeder profiles (tier + has_breeder_profile) ── */
  const sp = (u, tier, hasBreeder, name, slug, city, opt = {}) => ({
    _id: oid(), user_id: u._id, business_name: name, slug, bio: L(`${name} — verified.`),
    location_city: city, location_country: city === "Amsterdam" ? "NL" : "BE",
    tier, has_breeder_profile: hasBreeder, species_specializations: ["dogs"],
    verification_status: "verified", verified_at: new Date(), badge_level: ["basic", "pro", "premium"][tier],
    years_experience: 3 + tier * 2, rating: 0, review_count: 0,
    total_sales: 20 + tier * 40, response_rate: 96, response_time_hours: 4 - tier, ...opt,
  });
  const spPriv  = sp(priv,  0, false, "Paul (private)",        "paul-private",      "Liège");
  const spFree  = sp(bFree, 0, true,  "Bea Breeders",          "bea-breeders",      "Ghent");
  const spPro   = sp(bPro,  1, true,  "Antwerp Family Dogs",   "antwerp-family",    "Antwerp");
  const spElite = sp(bElite,2, true,  "Goldenfarm Kennel",     "goldenfarm-kennel", "Brussels");
  await SellerProfile.insertMany([spPriv, spFree, spPro, spElite]);

  /* ── Shelter profiles ── */
  const shp = (u, name, slug, city) => ({
    _id: oid(), user_id: u._id, organization_name: name, slug, bio: L(`${name} — rescue & rehome.`),
    location_city: city, location_country: "BE", verification_status: "verified",
    adoption_enabled: true, donation_enabled: true, optional_tip_enabled: true, rating: 0, review_count: 0,
  });
  const shHappy = shp(shelter, "Happy Paws Rescue", "happy-paws", "Bruges");
  const shVet   = shp(vetShel, "Refuge du Dr. Luc", "refuge-luc", "Namur");
  await ShelterProfile.insertMany([shHappy, shVet]);

  /* ── Vet profiles ── */
  const vp = (u, name, slug, city) => ({
    _id: oid(), user_id: u._id, clinic_name: name, business_name: name, slug, bio: L(`${name} clinic.`),
    location_city: city, location_country: "BE", license_number: "VET-BE-" + Math.floor(Math.random() * 9000 + 1000),
    specializations: ["Surgery", "Dermatology"], services: ["Consultation", "Vaccination", "Surgery"],
    languages: ["fr", "nl", "en"], verification_status: "verified", accepts_new_patients: true, telemedicine: true,
    rating: 0, review_count: 0,
  });
  const vMertens = vp(vet, "Clinique Mertens", "clinique-mertens", "Brussels");
  const vLuc = vp(vetShel, "Clinique du Dr. Luc", "clinique-luc", "Namur");
  await VetProfile.insertMany([vMertens, vLuc]);

  /* ── Real reviews (so rating/review_count are truthful) ── */
  const reviewers = [rev1, rev2, rev3];
  const reviewPool = [
    { rating: 5, title: "Exceptional, highly recommended", body: "Healthy, well-socialized and exactly as described. Clear communication throughout — the best decision we made." },
    { rating: 5, title: "Professional and trustworthy", body: "Smooth, transparent process. All documents and health tests were impeccable. Would absolutely recommend." },
    { rating: 4, title: "Great experience overall", body: "Knowledgeable and responsive, answered every question thoroughly. Very happy a year on." },
  ];
  const mkReviews = (key, id) => reviewPool.map((r, i) => ({
    _id: oid(), [key]: id, reviewer_id: reviewers[i % reviewers.length]._id,
    rating: r.rating, title: r.title, body: r.body, created_at: new Date(Date.now() - i * 20 * 86400000),
  }));
  const avg = (rs) => +(rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(2);
  const allReviews = [];
  for (const p of [spFree, spPro, spElite]) {
    const rs = mkReviews("seller_id", p._id);
    allReviews.push(...rs);
    await SellerProfile.updateOne({ _id: p._id }, { review_count: rs.length, rating: avg(rs) });
  }
  for (const v of [vMertens, vLuc]) {
    const rs = mkReviews("vet_id", v._id);
    allReviews.push(...rs);
    await VetProfile.updateOne({ _id: v._id }, { review_count: rs.length, rating: avg(rs) });
  }
  for (const s of [shHappy, shVet]) {
    const rs = mkReviews("shelter_id", s._id);
    allReviews.push(...rs);
    await ShelterProfile.updateOne({ _id: s._id }, { review_count: rs.length, rating: avg(rs) });
  }
  await Review.insertMany(allReviews);

  /* ── Species / Breeds ── */
  const species = {};
  for (const [slug, name] of [["dogs", "Dogs"], ["cats", "Cats"], ["rabbits", "Rabbits"], ["birds", "Birds"], ["horses", "Horses"], ["exotic", "Exotic"]]) {
    const _id = oid(); species[slug] = _id; await Species.create({ _id, slug, name: L(name), listing_count: 0 });
  }
  const breeds = {};
  for (const [slug, name, s] of [["golden-retriever", "Golden Retriever", "dogs"], ["french-bulldog", "French Bulldog", "dogs"], ["labrador", "Labrador Retriever", "dogs"], ["husky", "Siberian Husky", "dogs"], ["corgi", "Welsh Corgi", "dogs"], ["maine-coon", "Maine Coon", "cats"], ["bengal", "Bengal", "cats"], ["kwpn", "KWPN", "horses"]]) {
    const _id = oid(); breeds[slug] = _id; await Breed.create({ _id, slug, name: L(name), species_id: species[s], size: "medium", energy_level: "high", good_with_kids: true });
  }

  /* ── Sale listings (owned by breeders, listing_type=sale) ── */
  const img = (u) => [{ url: u, is_primary: true }];
  const sale = [
    { sp: spElite, breed: "golden-retriever", s: "dogs", price: 145000, city: "Brussels", cc: "BE", age: 10, g: "male",   feat: true,  u: "1601979031925-424e53b6caaa" },
    { sp: spPro,   breed: "french-bulldog",  s: "dogs", price: 285000, city: "Antwerp",  cc: "BE", age: 12, g: "female", feat: false, u: "1583337130417-3346a1be7dee" },
    { sp: spElite, breed: "maine-coon",      s: "cats", price: 95000,  city: "Amsterdam",cc: "NL", age: 14, g: "male",   feat: true,  u: "1574158622682-e40e69881006" },
    { sp: spFree,  breed: "labrador",        s: "dogs", price: 125000, city: "Ghent",    cc: "BE", age: 9,  g: "female", feat: false, u: "1591946614720-90a587da4a36" },
    { sp: spPro,   breed: "husky",           s: "dogs", price: 165000, city: "Ghent",    cc: "BE", age: 11, g: "male",   feat: true,  u: "1587300003388-59208cc962cb" },
    { sp: spElite, breed: "kwpn",            s: "horses",price:850000, city: "Ghent",    cc: "BE", age: 26, g: "male",   feat: false, u: "1553284965-83fd3e82fa5a" },
    { sp: spPriv,  breed: "corgi",           s: "dogs", price: 195000, city: "Liège",    cc: "BE", age: 10, g: "female", feat: false, u: "1576201836106-db1758fd1c97" },
    { sp: spElite, breed: "bengal",          s: "cats", price: 180000, city: "Brussels", cc: "BE", age: 13, g: "male",   feat: false, u: "1583511655857-d19b40a7a54e" },
  ];
  for (const l of sale) {
    const bn = (k) => k.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    await Listing.create({
      seller_id: l.sp._id, species_id: species[l.s], breed_id: breeds[l.breed],
      title: L(`${bn(l.breed)} puppy`), description: L(`Healthy, vaccinated ${bn(l.breed)} from a verified breeder.`),
      price: l.price, gender: l.g, age_weeks: l.age, vaccinated: true, dewormed: true, vet_checked: true, pedigree: true,
      location_city: l.city, location_country: l.cc, status: "active", listing_type: "sale", owner_capability: "seller",
      is_featured: l.feat, view_count: Math.floor(Math.random() * 400), inquiry_count: Math.floor(Math.random() * 20),
      images: img(`https://images.unsplash.com/photo-${l.u}?w=900&h=700&fit=crop`), documents: [], published_at: new Date(),
    });
  }

  /* ── Adoption listings (owned by shelter, listing_type=adoption, no Buy Now) ── */
  const adopt = [
    { breed: "labrador", s: "dogs", city: "Bruges", age: 52, g: "female", u: "1543466835-00a7907e9de1" },
    { breed: "maine-coon", s: "cats", city: "Bruges", age: 30, g: "male", u: "1518791841217-8f162f1e1131" },
  ];
  for (const a of adopt) {
    const bn = (k) => k.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    await Listing.create({
      shelter_id: shHappy._id, seller_id: null, species_id: species[a.s], breed_id: breeds[a.breed],
      title: L(`${bn(a.breed)} looking for a home`), description: L(`Rescued ${bn(a.breed)} ready for adoption. Vaccinated and health-checked.`),
      price: 0, gender: a.g, age_weeks: a.age, vaccinated: true, dewormed: true, vet_checked: true,
      location_city: a.city, location_country: "BE", status: "active", listing_type: "adoption", owner_capability: "shelter",
      is_featured: false, view_count: Math.floor(Math.random() * 200), inquiry_count: Math.floor(Math.random() * 10),
      images: img(`https://images.unsplash.com/photo-${a.u}?w=900&h=700&fit=crop`), documents: [], published_at: new Date(),
    });
  }

  console.log("\nSeeded users (email / role):");
  const tierOf = (u) => ({ [spPriv.user_id]: 0, [spFree.user_id]: 0, [spPro.user_id]: 1, [spElite.user_id]: 2 }[u._id] ?? 0);
  const breederOf = (u) => [spFree.user_id, spPro.user_id, spElite.user_id].some((id) => String(id) === String(u._id));
  for (const u of users) console.log(`  ${u.email.padEnd(28)} → ${effectiveRole(u, tierOf(u), breederOf(u))}`);
  console.log("\nPasswords:  admin → Admin123!   |   everyone else → Pawtrust123!");
  console.log(`Seeded: ${users.length} users · 4 seller · 2 shelter · 2 vet · 6 species · 8 breeds · ${sale.length} sale + ${adopt.length} adoption listings`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
