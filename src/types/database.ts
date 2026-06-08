export type UserRole = "buyer" | "seller" | "vet" | "admin";
export type UserLocale = "en" | "fr" | "nl";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type SubscriptionStatus = "inactive" | "active" | "cancelled";
export type BadgeLevel = "basic" | "pro" | "premium";
export type BreedSize = "tiny" | "small" | "medium" | "large" | "giant";
export type EnergyLevel = "low" | "medium" | "high" | "very_high";
export type ListingGender = "male" | "female";
export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "sold"
  | "expired"
  | "archived";
export type InquiryStatus = "new" | "read" | "replied" | "closed";

export interface LocalizedText {
  en: string;
  fr: string;
  nl: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  locale: UserLocale;
  created_at: string;
}

export interface Species {
  id: string;
  name: LocalizedText;
  slug: string;
  icon_url: string | null;
  listing_count: number;
  created_at: string;
}

export interface Breed {
  id: string;
  species_id: string;
  name: LocalizedText;
  slug: string;
  size: BreedSize | null;
  energy_level: EnergyLevel | null;
  good_with_kids: boolean;
  good_with_other_pets: boolean;
  hypoallergenic: boolean;
  avg_price_min: number | null;
  avg_price_max: number | null;
  created_at: string;
  species?: Species;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  bio: LocalizedText;
  location_city: string | null;
  location_country: string;
  approval_number: string | null;
  enci_number: string | null;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  verified_at: string | null;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  badge_level: BadgeLevel;
  years_experience: number;
  website_url: string | null;
  phone: string | null;
  response_rate: number;
  response_time_hours: number;
  total_listings: number;
  total_sales: number;
  rating: number;
  review_count: number;
  cover_url: string | null;
  social_links: Record<string, string>;
  created_at: string;
  user?: User;
}

export interface VetProfile {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  bio: LocalizedText;
  location_city: string | null;
  location_country: string;
  license_number: string | null;
  specializations: string[];
  verification_status: VerificationStatus;
  accepts_new_patients: boolean;
  telemedicine: boolean;
  languages: string[];
  website_url: string | null;
  phone: string | null;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  created_at: string;
  user?: User;
}

export interface ListingImage {
  url: string;
  storage_path: string;
  is_primary: boolean;
}

export interface ListingDocument {
  name: string;
  url: string;
  type: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  species_id: string;
  breed_id: string | null;
  title: LocalizedText;
  description: LocalizedText;
  price: number;
  price_negotiable: boolean;
  gender: ListingGender | null;
  age_weeks: number | null;
  color: string | null;
  microchip_number: string | null;
  passport_number: string | null;
  vaccinated: boolean;
  dewormed: boolean;
  vet_checked: boolean;
  pedigree: boolean;
  pedigree_organization: string | null;
  ready_date: string | null;
  location_city: string | null;
  location_country: string;
  status: ListingStatus;
  is_featured: boolean;
  view_count: number;
  inquiry_count: number;
  images: ListingImage[];
  documents: ListingDocument[];
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
  seller?: SellerProfile;
  species?: Species;
  breed?: Breed;
}

export interface Inquiry {
  id: string;
  listing_id: string;
  buyer_user_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
  listing?: Listing;
}

export interface Review {
  id: string;
  reviewer_id: string;
  seller_id: string | null;
  vet_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  reviewer?: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

// Search / filter types
export interface ListingFilters {
  species?: string;
  breed?: string;
  minAge?: number;
  maxAge?: number;
  minPrice?: number;
  maxPrice?: number;
  gender?: ListingGender;
  country?: string;
  city?: string;
  verifiedOnly?: boolean;
  pedigree?: boolean;
  vaccinated?: boolean;
  availableNow?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "most_viewed";
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
