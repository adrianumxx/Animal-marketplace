// Lightweight API client. Supabase cookie sessions are primary; Bearer token is kept as a transition fallback.
const BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pt_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
    credentials: "same-origin",
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const api = {
  auth: {
    signup: (body: object) => request<{ token: string; user: AppUser; seller_id: string | null }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
    login:  (body: object) => request<{ token: string; user: AppUser; seller_id: string | null }>("/auth/login",  { method: "POST", body: JSON.stringify(body) }),
    me:     () => request<AppUser>("/auth/me"),
    updateProfile: (body: { full_name?: string; avatar_url?: string }) => request<{ success: boolean }>("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
    logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  },
  favorites: {
    list:   () => request<{ favorites: FavoriteEntry[] }>("/favorites"),
    add:    (listing_id: string) => request<{ favorited: boolean }>("/favorites", { method: "POST", body: JSON.stringify({ listing_id }) }),
    remove: (listing_id: string) => request<{ favorited: boolean }>("/favorites", { method: "DELETE", body: JSON.stringify({ listing_id }) }),
  },
  inquiries: {
    mine: () => request<{ inquiries: InquiryEntry[] }>("/inquiries"),
    create: (body: { listing_id?: string; seller_id?: string; shelter_id?: string; vet_id?: string; message: string; buyer_name?: string; buyer_email?: string; buyer_phone?: string }) =>
      request<{ success: boolean; id: string }>("/inquiries", { method: "POST", body: JSON.stringify(body) }),
  },
  memory: {
    recentlyViewed: () => request<{ recently_viewed: FavoriteEntry[] }>("/me/recently-viewed"),
    clearRecent:    () => request<{ success: boolean }>("/me/recently-viewed", { method: "DELETE" }),
    getPreferences: () => request<{ preferences: Preferences }>("/me/preferences"),
    setPreferences: (p: Partial<Preferences>) => request<{ preferences: Preferences }>("/me/preferences", { method: "PUT", body: JSON.stringify(p) }),
    recommended:    () => request<{ listings: Listing[]; personalized: boolean }>("/listings/recommended"),
  },
  savedSearches: {
    list:   () => request<{ saved_searches: SavedSearchEntry[] }>("/saved-searches"),
    create: (body: { name: string; params: Record<string, string>; alert?: boolean }) => request<{ saved_search: SavedSearchEntry }>("/saved-searches", { method: "POST", body: JSON.stringify(body) }),
    remove: (id: string) => request<{ success: boolean }>(`/saved-searches?id=${id}`, { method: "DELETE" }),
  },
  stats: {
    get: () => request<{ listings: number; breeders: number; shelters: number; vets: number }>("/stats"),
  },
  cities: {
    list: () => request<{ cities: string[] }>("/cities"),
  },
  donations: {
    create: (body: { shelter_id: string; amount: number; donor_name?: string; donor_email?: string; message?: string }) =>
      request<{ donation_id: string; amount: number; platform_fee: number; net_amount: number; payment_pending: boolean }>("/donations", { method: "POST", body: JSON.stringify(body) }),
  },
  upload: {
    image: async (file: File): Promise<{ url: string }> => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}/upload`, { method: "POST", headers: authHeaders(), credentials: "same-origin", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      return data as { url: string };
    },
  },
  account: {
    become: (body: { capability: "seller" | "shelter" | "vet"; breeder?: boolean; business_name?: string; country?: string }) =>
      request<{ success: boolean; capability: string; user: { id: string; role: string; capabilities: string[] } }>("/account/become", { method: "POST", body: JSON.stringify(body) }),
    upgrade: (tier: number) =>
      request<{ success: boolean; placeholder: boolean; message: string }>("/account/upgrade", { method: "POST", body: JSON.stringify({ tier }) }),
  },
  adminUsers: {
    list:   (search = "") => request<{ users: AdminUserRow[] }>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    update: (body: { id: string; role?: string; capabilities?: string[]; account_status?: string; seller_tier?: number }) =>
      request<{ user: AdminUserRow | null }>("/admin/users", { method: "PATCH", body: JSON.stringify(body) }),
  },
  shelterDash: {
    me:     () => request<ShelterDashboard>("/shelters/me"),
    update: (body: Record<string, unknown>) => request<{ success: boolean }>("/shelters/me", { method: "PUT", body: JSON.stringify(body) }),
  },
  vetDash: {
    me:     () => request<{ profile: VetProfileData }>("/vets/me"),
    update: (body: Record<string, unknown>) => request<{ success: boolean }>("/vets/me", { method: "PUT", body: JSON.stringify(body) }),
  },
  conversations: {
    list:   () => request<{ conversations: ConversationSummary[] }>("/conversations"),
    thread: (id: string) => request<{ conversation: ConversationHead; messages: ThreadMessage[] }>(`/conversations/${id}`),
    send:   (id: string, body: string) => request<{ message: ThreadMessage }>(`/conversations/${id}`, { method: "POST", body: JSON.stringify({ body }) }),
  },
  notifications: {
    list: () => request<{ notifications: NotificationEntry[]; unread: number }>("/notifications"),
    markRead: (id?: string) => request<{ success: boolean }>("/notifications", { method: "PATCH", body: JSON.stringify(id ? { id } : {}) }),
  },
  buyerNotes: {
    list:   (buyerEmail: string) => request<{ notes: BuyerNoteEntry[] }>(`/buyer-notes?buyer_email=${encodeURIComponent(buyerEmail)}`),
    create: (body: { buyer_email?: string; buyer_user_id?: string; body: string }) => request<{ note: BuyerNoteEntry }>("/buyer-notes", { method: "POST", body: JSON.stringify(body) }),
  },
  listings: {
    search: (params: Record<string, string | number | boolean>) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== "" && v !== undefined).map(([k,v]) => [k, String(v)])).toString();
      return request<ListingsResponse>(`/listings${qs ? "?" + qs : ""}`);
    },
    get:    (id: string) => request<{ listing: Listing }>(`/listings/${id}`),
    create: (body: object) => request<{ listing: Listing }>("/listings", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: object) => request<{ listing: Listing }>(`/listings/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean }>(`/listings/${id}`, { method: "DELETE" }),
  },
  sellers: {
    get:       (id: string) => request<{ seller: Seller }>(`/sellers/${id}`),
    update:    (id: string, body: object) => request<{ seller: Seller }>(`/sellers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    dashboard: (id: string) => request<DashboardData>(`/sellers/${id}/dashboard`),
  },
  reviews: {
    list:   (seller_id: string) => request<{ reviews: Review[] }>(`/reviews?seller_id=${seller_id}`),
    create: (body: object)      => request<{ review: Review }>("/reviews", { method: "POST", body: JSON.stringify(body) }),
  },
  documents: {
    upload: (body: object) => request<{ document: Document }>("/documents/upload", { method: "POST", body: JSON.stringify(body) }),
    verify: (id: string)   => request<VerifyResult>(`/documents/${id}/verify`),
  },
};

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  capabilities?: string[];
  effective_role?: string;
  seller_tier?: number;
  avatar_url?: string | null;
  seller_id?: string | null;
}

interface PopulatedListing {
  _id: string;
  title?: Record<string, string>;
  price?: number;
  location_city?: string;
  location_country?: string;
  images?: { url: string; is_primary?: boolean }[];
  breed_id?: { name?: Record<string, string> } | null;
  seller_id?: { business_name?: string; slug?: string } | null;
}

export interface FavoriteEntry {
  _id: string;
  created_at: string;
  listing_id: PopulatedListing | null;
}

export interface InquiryEntry {
  _id: string;
  message: string;
  status: string;
  created_at: string;
  listing_id: PopulatedListing | null;
}

export interface Preferences {
  species: string[];
  breeds: string[];
  budget_max: number | null;
  locations: string[];
}

export interface SavedSearchEntry {
  id: string;
  name: string;
  params: Record<string, string>;
  alert: boolean;
  created_at: string;
}

export interface BuyerNoteEntry {
  id: string;
  body: string;
  created_at: string;
}

export interface ShelterDashboard {
  profile: Record<string, unknown> & { id: string; organization_name?: string; location_city?: string; phone?: string; website_url?: string; bio?: { en?: string } };
  stats: { listings: number; active: number; adopted: number; requests: number };
  listings: { id: string; title: string; status: string; view_count: number; inquiry_count: number; image: string | null }[];
  requests: { id: string; buyer_name: string; buyer_email: string; message: string; listing_title: string; created_at: string }[];
}
export interface VetProfileData {
  id: string; clinic_name?: string; location_city?: string; phone?: string; website_url?: string;
  bio?: { en?: string }; services?: string[]; specializations?: string[]; languages?: string[];
  telemedicine?: boolean; accepts_new_patients?: boolean; avatar_url?: string;
  booking_url?: string;
  opening_hours?: { weekday: number; open: string; close: string }[];
}

export interface ConversationSummary {
  id: string;
  listing_id: string | null;
  listing_title: string;
  role: "buyer" | "owner";
  counterpart: string;
  last_message: string;
  updated_at: string;
  unread: number;
}
export interface ConversationHead {
  id: string;
  listing_id: string | null;
  listing_title: string;
  counterpart: string;
}
export interface ThreadMessage {
  id: string;
  body: string;
  mine: boolean;
  created_at: string;
}

export interface NotificationEntry {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  capabilities: string[];
  account_status: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  price: number;
  price_negotiable: boolean;
  gender: string | null;
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
  status: string;
  is_featured: boolean;
  view_count: number;
  inquiry_count: number;
  images: { url: string; is_primary?: boolean }[];
  documents: { name: string; url: string; type: string }[];
  created_at: string;
  species: { slug: string; name: Record<string, string> };
  breed: { name: Record<string, string>; size?: string; energy_level?: string; good_with_kids?: boolean; good_with_other_pets?: boolean } | null;
  seller: Seller;
}

export interface Seller {
  id: string;
  business_name: string;
  slug: string;
  bio_en?: string;
  location_city: string | null;
  location_country: string;
  verification_status: string;
  badge_level: string;
  rating: number;
  review_count: number;
  response_time_hours?: number;
  response_rate?: number;
  total_sales?: number;
  years_experience?: number;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardData {
  stats: { total_listings: number; active_listings: number; total_views: number; total_inquiries: number };
  recent_listings: Listing[];
  recent_messages: { id: string; body: string; sender_name: string; sender_email: string; listing_title: string; created_at: string }[];
}

export interface Review {
  id: string;
  reviewer_name: string;
  seller_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  verified: boolean;
  confidence: number | null;
}

export interface VerifyResult {
  id: string;
  verified: boolean;
  confidence: number | null;
  ai_notes: string | null;
  status: string;
}
