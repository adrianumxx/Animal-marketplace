import { revalidatePath } from "next/cache";
import { AdminUserManager } from "@/components/admin/user-manager";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SellerProfile, VetProfile, Listing, ListingDocument } from "@/lib/models";
import { createNotification, notifyMatchingSavedSearches } from "@/lib/notifications";

type ModerationData = {
  sellers: Record<string, unknown>[];
  vets: Record<string, unknown>[];
  listings: Record<string, unknown>[];
  documents: Record<string, unknown>[];
};

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function localizedEn(value: unknown) {
  if (value && typeof value === "object" && "en" in value) {
    return text((value as Record<string, unknown>).en, "Untitled listing");
  }
  return "Untitled listing";
}

async function getAdminUserId() {
  try {
    const user = await getAuthUser();
    return user && user.role === "admin" ? user.userId : null;
  } catch {
    return null;
  }
}

function serialize(arr: Record<string, unknown>[]): Record<string, unknown>[] {
  return arr.map((r) => ({ ...r, id: String(r._id) }));
}

async function getModerationData(): Promise<ModerationData> {
  await connectDB();
  const [sellers, vets, listings, documents] = await Promise.all([
    SellerProfile.find({ verification_status: { $in: ["pending", "rejected"] } }).sort({ created_at: -1 }).limit(50).lean(),
    VetProfile.find({ verification_status: { $in: ["pending", "rejected"] } }).sort({ created_at: -1 }).limit(50).lean(),
    Listing.find({ status: { $in: ["pending_review", "archived"] } }).sort({ created_at: -1 }).limit(50)
      .populate({ path: "seller_id", select: "business_name verification_status" }).lean(),
    ListingDocument.find({ verified: false }).sort({ created_at: -1 }).limit(50)
      .populate({ path: "seller_id", select: "business_name" }).lean(),
  ]);

  return {
    sellers: serialize(sellers as Record<string, unknown>[]),
    vets: serialize(vets as Record<string, unknown>[]),
    listings: serialize(listings as Record<string, unknown>[]),
    documents: serialize(documents as Record<string, unknown>[]),
  };
}

async function moderate(formData: FormData) {
  "use server";

  const adminUserId = await getAdminUserId();
  if (!adminUserId) throw new Error("Forbidden");

  const target = text(formData.get("target"));
  const id = text(formData.get("id"));
  const action = text(formData.get("action"));
  const notes = text(formData.get("notes")).trim();
  if (!/^[a-f0-9]{24}$/i.test(id)) return;

  await connectDB();

  if (target === "seller") {
    const status = action === "approve" ? "verified" : "rejected";
    const doc = await SellerProfile.findByIdAndUpdate(id, {
      verification_status: status,
      verification_notes: notes || null,
      verified_at: status === "verified" ? new Date() : null,
    }, { new: true }).lean<{ user_id?: unknown }>();
    if (status === "verified" && doc?.user_id) {
      await createNotification({ userId: String(doc.user_id), type: "verification", title: "Your seller profile is verified", body: "You can now publish listings.", link: "/dashboard" });
    }
  }

  if (target === "vet") {
    const status = action === "approve" ? "verified" : "rejected";
    const doc = await VetProfile.findByIdAndUpdate(id, { verification_status: status }, { new: true }).lean<{ user_id?: unknown }>();
    if (status === "verified" && doc?.user_id) {
      await createNotification({ userId: String(doc.user_id), type: "verification", title: "Your vet profile is verified", body: "You now appear in the vet directory.", link: "/account" });
    }
  }

  if (target === "listing") {
    const status = action === "approve" ? "active" : "archived";
    await Listing.findByIdAndUpdate(id, { status, published_at: status === "active" ? new Date() : null });
    if (status === "active") await notifyMatchingSavedSearches(id);
  }

  if (target === "document") {
    const verified = action === "approve";
    await ListingDocument.findByIdAndUpdate(id, {
      verified,
      confidence: verified ? 100 : 0,
      ai_notes: notes || (verified ? "Approved by admin" : "Rejected by admin"),
    });
  }

  revalidatePath("/[locale]/admin", "page");
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-[rgba(232,228,221,0.45)]">
      {label}
    </div>
  );
}

function ModerationCard({
  target,
  id,
  title,
  subtitle,
  status,
}: {
  target: string;
  id: string;
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--t-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-bold text-[var(--t-text)]">{title}</div>
          <div className="mt-1 text-xs text-[rgba(232,228,221,0.42)]">{subtitle}</div>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[rgba(232,228,221,0.55)]">
          {status}
        </span>
      </div>

      <form action={moderate} className="mt-4 grid gap-3">
        <input type="hidden" name="target" value={target} />
        <input type="hidden" name="id" value={id} />
        <textarea
          name="notes"
          rows={2}
          placeholder="Internal notes"
          className="min-h-16 rounded-xl border border-white/[0.08] bg-[var(--t-bg)] px-3 py-2 text-sm text-[var(--t-text)] outline-none placeholder:text-[rgba(232,228,221,0.28)]"
        />
        <div className="flex gap-2">
          <button
            name="action"
            value="approve"
            className="rounded-xl bg-[var(--color-accent-teal)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
          >
            Approve
          </button>
          <button
            name="action"
            value="reject"
            className="rounded-xl border border-white/[0.10] px-4 py-2 text-sm font-bold text-[rgba(232,228,221,0.72)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Reject
          </button>
        </div>
      </form>
    </div>
  );
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const adminUserId = await getAdminUserId();

  if (!adminUserId) {
    return (
      <main className="min-h-screen bg-[var(--t-bg)] px-6 pt-28 text-[var(--t-text)]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-[var(--t-surface)] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">Admin only</p>
          <h1 className="mt-3 text-3xl font-bold">Moderation is protected</h1>
          <p className="mt-3 text-sm text-[rgba(232,228,221,0.52)]">
            Sign in with an admin account to review sellers, vets, listings and documents.
          </p>
        </div>
      </main>
    );
  }

  let data: ModerationData;
  try {
    data = await getModerationData();
  } catch (error) {
    return (
      <main className="min-h-screen bg-[var(--t-bg)] px-6 pt-28 text-[var(--t-text)]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-[var(--t-surface)] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">Supabase setup</p>
          <h1 className="mt-3 text-3xl font-bold">Moderation data is unavailable</h1>
          <p className="mt-3 text-sm text-[rgba(232,228,221,0.52)]">
            {error instanceof Error ? error.message : "Connect Supabase environment variables to load the queue."}
          </p>
        </div>
      </main>
    );
  }

  const sections = [
    { key: "sellers", title: "Seller verification", rows: data.sellers, empty: "No sellers waiting for review." },
    { key: "vets", title: "Vet verification", rows: data.vets, empty: "No vets waiting for review." },
    { key: "listings", title: "Listing review", rows: data.listings, empty: "No listings waiting for review." },
    { key: "documents", title: "Document review", rows: data.documents, empty: "No documents waiting for review." },
  ];

  return (
    <main className="min-h-screen bg-[var(--t-bg)] px-6 py-28 text-[var(--t-text)] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1760px]">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">PawTrust operations</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.02em]">Moderation queue</h1>
          <p className="mt-2 text-sm text-[rgba(232,228,221,0.48)]">
            Review pending profiles, submitted listings and private listing documents.
          </p>
        </div>

        <AdminUserManager />

        <div className="grid gap-6 xl:grid-cols-2">
          {sections.map((section) => (
            <section key={section.key} className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold">{section.title}</h2>
                <span className="text-xs text-[rgba(232,228,221,0.38)]">{section.rows.length} open</span>
              </div>
              <div className="grid gap-3">
                {section.rows.length === 0 && <EmptyState label={section.empty} />}
                {section.rows.map((row) => {
                  const id = text(row.id);
                  const seller = (row.seller_id && typeof row.seller_id === "object"
                    ? row.seller_id
                    : undefined) as Record<string, unknown> | undefined;
                  const title =
                    section.key === "listings"
                      ? localizedEn(row.title)
                      : text(row.business_name, text(row.name, "Untitled"));
                  const subtitle =
                    section.key === "documents"
                      ? `${text(row.name, "Document")} for ${text(seller?.business_name, "seller")}`
                      : section.key === "listings"
                        ? `${text(seller?.business_name, "Seller")} · ${text(row.location_city, "No city")}`
                        : `${text(row.location_city, "No city")} · ${text(row.location_country, "No country")}`;
                  const status = text(row.status, text(row.verification_status, row.verified ? "verified" : "pending"));

                  return (
                    <ModerationCard
                      key={id}
                      target={section.key === "sellers" ? "seller" : section.key === "vets" ? "vet" : section.key === "listings" ? "listing" : "document"}
                      id={id}
                      title={title}
                      subtitle={subtitle}
                      status={status}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <a href={`/${locale}/dashboard`} className="mt-8 inline-flex text-sm font-semibold text-[rgba(232,228,221,0.45)] hover:text-[var(--color-accent)]">
          Back to dashboard
        </a>
      </div>
    </main>
  );
}
