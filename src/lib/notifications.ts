import { connectDB } from "@/lib/mongodb";
import { Notification, SavedSearch, Listing } from "@/lib/models";

interface NotifyInput {
  userId: string;
  type: "inquiry" | "saved_search" | "verification" | "system";
  title: string;
  body?: string;
  link?: string;
}

const hasResend = () => Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder"));

export async function createNotification(input: NotifyInput) {
  await connectDB();
  await Notification.create({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });
  // Email delivery is wired behind a real Resend key (placeholder = in-app only for now).
  if (hasResend()) {
    // TODO billing/email sprint: send via Resend
  }
}

/**
 * Fire saved-search alerts when a listing becomes active.
 * Matches on species slug + price range (the params the search bar produces).
 */
export async function notifyMatchingSavedSearches(listingId: string) {
  await connectDB();
  const listing = await Listing.findById(listingId).populate({ path: "species_id", select: "slug" }).lean<{
    _id: unknown; price?: number; listing_type?: string; species_id?: { slug?: string };
  }>();
  if (!listing) return;

  const speciesSlug = listing.species_id?.slug ?? "";
  const price = Number(listing.price ?? 0);

  const searches = await SavedSearch.find({ alert: true }).lean();
  for (const s of searches) {
    const p = (s.params ?? {}) as Record<string, string>;
    if (p.species && p.species !== speciesSlug) continue;
    if (p.min_price && price < Number(p.min_price)) continue;
    if (p.max_price && price > Number(p.max_price)) continue;
    await createNotification({
      userId: String(s.user_id),
      type: "saved_search",
      title: `New match for "${s.name}"`,
      body: "A new listing matches your saved search.",
      link: `/listings/${String(listing._id)}`,
    });
  }
}
