import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/lib/models";

function err(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const [rows, unread] = await Promise.all([
      Notification.find({ user_id: user.userId }).sort({ created_at: -1 }).limit(30).lean(),
      Notification.countDocuments({ user_id: user.userId, read: false }),
    ]);
    return NextResponse.json({
      notifications: rows.map((n) => ({ ...n, id: String((n as Record<string, unknown>)._id) })),
      unread,
    });
  } catch (e) { return err(e); }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    await connectDB();
    if (body.id && /^[a-f0-9]{24}$/i.test(body.id)) {
      await Notification.updateOne({ _id: body.id, user_id: user.userId }, { $set: { read: true } });
    } else {
      await Notification.updateMany({ user_id: user.userId, read: false }, { $set: { read: true } });
    }
    return NextResponse.json({ success: true });
  } catch (e) { return err(e); }
}
