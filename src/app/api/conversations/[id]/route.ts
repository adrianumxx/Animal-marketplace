import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Inquiry, Listing, SellerProfile, ShelterProfile, Message } from "@/lib/models";
import { createNotification } from "@/lib/notifications";

function err(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : m === "Forbidden" ? 403 : 500 });
}

async function ownerUserIdOf(listingId: unknown): Promise<string | null> {
  const l = await Listing.findById(listingId).select("seller_id shelter_id").lean<{ seller_id?: unknown; shelter_id?: unknown }>();
  if (!l) return null;
  if (l.seller_id) { const sp = await SellerProfile.findById(l.seller_id).select("user_id").lean<{ user_id?: unknown }>(); return sp?.user_id ? String(sp.user_id) : null; }
  if (l.shelter_id) { const shp = await ShelterProfile.findById(l.shelter_id).select("user_id").lean<{ user_id?: unknown }>(); return shp?.user_id ? String(shp.user_id) : null; }
  return null;
}

async function authorize(id: string, userId: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const inquiry = await Inquiry.findById(id).populate({ path: "listing_id", select: "title" }).lean<Record<string, unknown>>();
  if (!inquiry) return null;
  const buyerUserId = inquiry.buyer_user_id ? String(inquiry.buyer_user_id) : null;
  const ownerUserId = await ownerUserIdOf(inquiry.listing_id && (inquiry.listing_id as Record<string, unknown>)._id);
  const isBuyer = buyerUserId === userId;
  const isOwner = ownerUserId === userId;
  if (!isBuyer && !isOwner) return null;
  return { inquiry, buyerUserId, ownerUserId, isBuyer };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    await connectDB();
    const ctx = await authorize(id, user.userId);
    if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await Message.updateMany({ inquiry_id: id, sender_id: { $ne: user.userId }, read: false }, { $set: { read: true } });
    const msgs = await Message.find({ inquiry_id: id }).sort({ created_at: 1 }).lean();

    const inq = ctx.inquiry;
    const listing = (inq.listing_id as { _id?: unknown; title?: { en?: string } }) ?? {};
    return NextResponse.json({
      conversation: {
        id,
        listing_id: listing._id ? String(listing._id) : null,
        listing_title: listing.title?.en ?? "Listing",
        counterpart: ctx.isBuyer ? "Breeder" : (inq.buyer_name as string),
      },
      messages: [
        { id: "root", body: inq.message as string, mine: ctx.isBuyer, created_at: inq.created_at },
        ...msgs.map((m) => ({ id: String((m as Record<string, unknown>)._id), body: m.body as string, mine: String(m.sender_id) === user.userId, created_at: m.created_at })),
      ],
    });
  } catch (e) { return err(e); }
}

const postSchema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    const parsed = await parseJson(req, postSchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    const ctx = await authorize(id, user.userId);
    if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const msg = await Message.create({ inquiry_id: id, sender_id: user.userId, body: parsed.body });

    const otherId = ctx.isBuyer ? ctx.ownerUserId : ctx.buyerUserId;
    if (otherId) {
      await createNotification({ userId: otherId, type: "inquiry", title: "New message", body: parsed.body.slice(0, 80), link: `/messages?c=${id}` });
    }

    return NextResponse.json({ message: { id: String(msg._id), body: msg.body, mine: true, created_at: msg.created_at } }, { status: 201 });
  } catch (e) { return err(e); }
}
