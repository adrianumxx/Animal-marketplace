import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SellerProfile, VetProfile, Listing, ListingDocument } from "@/lib/models";
import { createNotification, notifyMatchingSavedSearches } from "@/lib/notifications";

const TARGETS = ["seller", "vet", "listing", "document"] as const;
type Target = (typeof TARGETS)[number];

function isTarget(value: unknown): value is Target {
  return typeof value === "string" && TARGETS.includes(value as Target);
}
function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}
function authError(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (error instanceof Error && error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();

    const [sellers, vets, listings, documents] = await Promise.all([
      SellerProfile.find({ verification_status: { $in: ["pending", "rejected"] } }).sort({ created_at: -1 }).limit(50).lean(),
      VetProfile.find({ verification_status: { $in: ["pending", "rejected"] } }).sort({ created_at: -1 }).limit(50).lean(),
      Listing.find({ status: { $in: ["pending_review", "archived"] } }).sort({ created_at: -1 }).limit(50)
        .populate({ path: "seller_id", select: "business_name verification_status" }).lean(),
      ListingDocument.find({ verified: false }).sort({ created_at: -1 }).limit(50)
        .populate({ path: "seller_id", select: "business_name" }).lean(),
    ]);

    const withId = (arr: Record<string, unknown>[]) => arr.map((r) => ({ ...r, id: String(r._id) }));
    return NextResponse.json({
      sellers: withId(sellers as Record<string, unknown>[]),
      vets: withId(vets as Record<string, unknown>[]),
      listings: withId(listings as Record<string, unknown>[]),
      documents: withId(documents as Record<string, unknown>[]),
    });
  } catch (error) {
    return authError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const target = body.target;
    const id = asString(body.id);
    const action = asString(body.action);
    const notes = asString(body.notes).trim();

    if (!isTarget(target) || !id || !action || !/^[a-f0-9]{24}$/i.test(id)) {
      return NextResponse.json({ error: "target, id and action are required" }, { status: 400 });
    }

    await connectDB();

    if (target === "seller") {
      const status = action === "approve" ? "verified" : action === "reject" ? "rejected" : null;
      if (!status) return NextResponse.json({ error: "Invalid seller action" }, { status: 400 });
      const doc = await SellerProfile.findByIdAndUpdate(id, {
        verification_status: status,
        verification_notes: notes || null,
        verified_at: status === "verified" ? new Date() : null,
      }, { new: true }).lean<{ user_id?: unknown }>();
      if (status === "verified" && doc?.user_id) {
        await createNotification({ userId: String(doc.user_id), type: "verification", title: "Your seller profile is verified", body: "You can now publish listings.", link: "/dashboard" });
      }
      return NextResponse.json({ seller: doc });
    }

    if (target === "vet") {
      const status = action === "approve" ? "verified" : action === "reject" ? "rejected" : null;
      if (!status) return NextResponse.json({ error: "Invalid vet action" }, { status: 400 });
      const doc = await VetProfile.findByIdAndUpdate(id, { verification_status: status }, { new: true }).lean<{ user_id?: unknown }>();
      if (status === "verified" && doc?.user_id) {
        await createNotification({ userId: String(doc.user_id), type: "verification", title: "Your vet profile is verified", body: "You now appear in the vet directory.", link: "/account" });
      }
      return NextResponse.json({ vet: doc });
    }

    if (target === "listing") {
      const status = action === "approve" ? "active" : action === "reject" ? "archived" : null;
      if (!status) return NextResponse.json({ error: "Invalid listing action" }, { status: 400 });
      const doc = await Listing.findByIdAndUpdate(id, {
        status,
        published_at: status === "active" ? new Date() : null,
      }, { new: true }).lean();
      if (status === "active") await notifyMatchingSavedSearches(id);
      return NextResponse.json({ listing: doc });
    }

    const verified = action === "approve" ? true : action === "reject" ? false : null;
    if (verified === null) return NextResponse.json({ error: "Invalid document action" }, { status: 400 });
    const doc = await ListingDocument.findByIdAndUpdate(id, {
      verified,
      confidence: verified ? 100 : 0,
      ai_notes: notes || (verified ? "Approved by admin" : "Rejected by admin"),
    }, { new: true }).lean();
    return NextResponse.json({ document: doc });
  } catch (error) {
    return authError(error);
  }
}
