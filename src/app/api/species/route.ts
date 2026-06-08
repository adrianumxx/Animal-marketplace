import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Species } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const rows = await Species.find().sort({ slug: 1 }).lean();
    const species = rows.map((row) => {
      const name = (row.name as Record<string, string>) ?? {};
      return {
        ...row,
        id: String((row as Record<string, unknown>)._id),
        name_en: name.en ?? row.slug,
        name_fr: name.fr ?? name.en ?? row.slug,
        name_nl: name.nl ?? name.en ?? row.slug,
      };
    });
    return NextResponse.json({ species });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
