import mongoose, { Schema, model, models, Types } from "mongoose";

/* ── Shared ────────────────────────────────────────────────── */
const localized = { en: { type: String, default: "" }, fr: { type: String, default: "" }, nl: { type: String, default: "" } };

/* ── User ──────────────────────────────────────────────────── */
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true, select: false },
    full_name: { type: String, default: null },
    avatar_url: { type: String, default: null },
    // role: identity/power only. Legacy values kept until Phase 4 migration narrows to user|admin.
    role: { type: String, enum: ["buyer", "seller", "vet", "admin", "user"], default: "buyer" },
    capabilities: { type: [String], enum: ["seller", "shelter", "vet"], default: [] },
    account_status: { type: String, enum: ["active", "suspended", "banned"], default: "active" },
    locale: { type: String, enum: ["en", "fr", "nl"], default: "en" },
    preferences: {
      species: { type: [String], default: [] },
      breeds: { type: [String], default: [] },
      budget_max: { type: Number, default: null },
      locations: { type: [String], default: [] },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Species / Breed ───────────────────────────────────────── */
const speciesSchema = new Schema(
  {
    name: localized,
    slug: { type: String, required: true, unique: true },
    icon_url: { type: String, default: null },
    listing_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const breedSchema = new Schema(
  {
    species_id: { type: Types.ObjectId, ref: "Species", required: true },
    name: localized,
    slug: { type: String, required: true, unique: true },
    size: { type: String, enum: ["tiny", "small", "medium", "large", "giant", null], default: null },
    energy_level: { type: String, enum: ["low", "medium", "high", "very_high", null], default: null },
    good_with_kids: { type: Boolean, default: false },
    good_with_other_pets: { type: Boolean, default: false },
    hypoallergenic: { type: Boolean, default: false },
    avg_price_min: { type: Number, default: null },
    avg_price_max: { type: Number, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Seller profile ────────────────────────────────────────── */
const sellerProfileSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    business_name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: localized,
    location_city: { type: String, default: null },
    location_country: { type: String, default: "BE" },
    approval_number: { type: String, default: null },
    enci_number: { type: String, default: null },
    // V1 role system: numeric tier (0=free,1=pro,2=elite) + breeder-profile flag.
    tier: { type: Number, enum: [0, 1, 2], default: 0 },
    has_breeder_profile: { type: Boolean, default: false },
    species_specializations: { type: [String], default: [] },
    verification_status: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "verified" },
    verification_notes: { type: String, default: null },
    verified_at: { type: Date, default: null },
    subscription_status: { type: String, enum: ["inactive", "active", "cancelled"], default: "inactive" },
    stripe_customer_id: { type: String, default: null },
    stripe_subscription_id: { type: String, default: null },
    badge_level: { type: String, enum: ["basic", "pro", "premium"], default: "basic" },
    boosts_used: { type: Number, default: 0 },
    boosts_period_start: { type: Date, default: null },
    years_experience: { type: Number, default: 0 },
    website_url: { type: String, default: null },
    phone: { type: String, default: null },
    response_rate: { type: Number, default: 100 },
    response_time_hours: { type: Number, default: 24 },
    total_listings: { type: Number, default: 0 },
    total_sales: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    cover_url: { type: String, default: null },
    social_links: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Vet profile ───────────────────────────────────────────── */
const vetProfileSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    business_name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: localized,
    location_city: { type: String, default: null },
    location_country: { type: String, default: "BE" },
    license_number: { type: String, default: null },
    specializations: { type: [String], default: [] },
    services: { type: [String], default: [] },
    opening_hours: { type: Schema.Types.Mixed, default: {} },
    verification_status: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "verified" },
    accepts_new_patients: { type: Boolean, default: true },
    telemedicine: { type: Boolean, default: false },
    languages: { type: [String], default: [] },
    website_url: { type: String, default: null },
    phone: { type: String, default: null },
    avatar_url: { type: String, default: null },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Shelter profile ───────────────────────────────────────── */
const shelterProfileSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    organization_name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: localized,
    location_city: { type: String, default: null },
    location_country: { type: String, default: "BE" },
    registration_number: { type: String, default: null },
    verification_status: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "verified" },
    adoption_enabled: { type: Boolean, default: true },
    donation_enabled: { type: Boolean, default: true },
    optional_tip_enabled: { type: Boolean, default: true },
    website_url: { type: String, default: null },
    phone: { type: String, default: null },
    cover_url: { type: String, default: null },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Listing ───────────────────────────────────────────────── */
const listingSchema = new Schema(
  {
    seller_id: { type: Types.ObjectId, ref: "SellerProfile", default: null },
    shelter_id: { type: Types.ObjectId, ref: "ShelterProfile", default: null },
    species_id: { type: Types.ObjectId, ref: "Species", required: true },
    breed_id: { type: Types.ObjectId, ref: "Breed", default: null },
    title: localized,
    description: localized,
    price: { type: Number, required: true },
    price_negotiable: { type: Boolean, default: false },
    gender: { type: String, enum: ["male", "female", null], default: null },
    age_weeks: { type: Number, default: null },
    color: { type: String, default: null },
    microchip_number: { type: String, default: null },
    passport_number: { type: String, default: null },
    vaccinated: { type: Boolean, default: false },
    dewormed: { type: Boolean, default: false },
    vet_checked: { type: Boolean, default: false },
    pedigree: { type: Boolean, default: false },
    pedigree_organization: { type: String, default: null },
    ready_date: { type: Date, default: null },
    location_city: { type: String, default: null },
    location_country: { type: String, default: "BE" },
    status: { type: String, enum: ["draft", "pending_review", "active", "sold", "expired", "archived"], default: "draft" },
    listing_type: { type: String, enum: ["sale", "adoption"], default: "sale" },
    owner_capability: { type: String, enum: ["seller", "shelter"], default: "seller" },
    is_featured: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
    inquiry_count: { type: Number, default: 0 },
    images: { type: [Schema.Types.Mixed], default: [] },
    documents: { type: [Schema.Types.Mixed], default: [] },
    published_at: { type: Date, default: null },
    expires_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Inquiry / Review / Favorite ───────────────────────────── */
const inquirySchema = new Schema(
  {
    listing_id: { type: Types.ObjectId, ref: "Listing", required: true },
    buyer_user_id: { type: Types.ObjectId, ref: "User", default: null },
    buyer_name: { type: String, required: true },
    buyer_email: { type: String, required: true },
    buyer_phone: { type: String, default: null },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "replied", "closed"], default: "new" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const reviewSchema = new Schema(
  {
    reviewer_id: { type: Types.ObjectId, ref: "User", required: true },
    seller_id: { type: Types.ObjectId, ref: "SellerProfile", default: null },
    vet_id: { type: Types.ObjectId, ref: "VetProfile", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null },
    body: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const favoriteSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    listing_id: { type: Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);
favoriteSchema.index({ user_id: 1, listing_id: 1 }, { unique: true });

/* ── Listing document (verification) ───────────────────────── */
const listingDocumentSchema = new Schema(
  {
    seller_id: { type: Types.ObjectId, ref: "SellerProfile", required: true },
    listing_id: { type: Types.ObjectId, ref: "Listing", default: null },
    name: { type: String, required: true },
    type: { type: String, default: "other" },
    url: { type: String, default: null },
    mime_type: { type: String, default: null },
    verified: { type: Boolean, default: false },
    confidence: { type: Number, default: null },
    ai_notes: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

/* ── Per-customer memory ───────────────────────────────────── */
const recentlyViewedSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    listing_id: { type: Types.ObjectId, ref: "Listing", required: true },
    viewed_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
recentlyViewedSchema.index({ user_id: 1, listing_id: 1 }, { unique: true });
recentlyViewedSchema.index({ user_id: 1, viewed_at: -1 });

const savedSearchSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    alert: { type: Boolean, default: false },
    last_alert_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const buyerNoteSchema = new Schema(
  {
    author_id: { type: Types.ObjectId, ref: "User", required: true },
    buyer_user_id: { type: Types.ObjectId, ref: "User", default: null },
    buyer_email: { type: String, default: null },
    body: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);
buyerNoteSchema.index({ author_id: 1, buyer_email: 1 });

/* ── Message (conversation thread on an inquiry) ───────────── */
const messageSchema = new Schema(
  {
    inquiry_id: { type: Types.ObjectId, ref: "Inquiry", required: true },
    sender_id: { type: Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);
messageSchema.index({ inquiry_id: 1, created_at: 1 });

/* ── Notification ──────────────────────────────────────────── */
const notificationSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["inquiry", "saved_search", "verification", "system"], default: "system" },
    title: { type: String, required: true },
    body: { type: String, default: null },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);
notificationSchema.index({ user_id: 1, created_at: -1 });

/* ── Exports (guarded for Next.js hot reload) ──────────────── */
export const User = models.User || model("User", userSchema);
export const Species = models.Species || model("Species", speciesSchema);
export const Breed = models.Breed || model("Breed", breedSchema);
export const SellerProfile = models.SellerProfile || model("SellerProfile", sellerProfileSchema);
export const VetProfile = models.VetProfile || model("VetProfile", vetProfileSchema);
export const ShelterProfile = models.ShelterProfile || model("ShelterProfile", shelterProfileSchema);
export const Listing = models.Listing || model("Listing", listingSchema);
export const Inquiry = models.Inquiry || model("Inquiry", inquirySchema);
export const Review = models.Review || model("Review", reviewSchema);
export const Favorite = models.Favorite || model("Favorite", favoriteSchema);
export const ListingDocument = models.ListingDocument || model("ListingDocument", listingDocumentSchema);
export const RecentlyViewed = models.RecentlyViewed || model("RecentlyViewed", recentlyViewedSchema);
export const SavedSearch = models.SavedSearch || model("SavedSearch", savedSearchSchema);
export const BuyerNote = models.BuyerNote || model("BuyerNote", buyerNoteSchema);
export const Notification = models.Notification || model("Notification", notificationSchema);
export const Message = models.Message || model("Message", messageSchema);

export type { mongoose };
