import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Breed } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    const speciesId = req.nextUrl.searchParams.get("species_id");
    await connectDB();
    const filter = speciesId && /^[a-f0-9]{24}$/i.test(speciesId) ? { species_id: speciesId } : {};
    const rows = await Breed.find(filter).sort({ slug: 1 }).lean();
    const breeds = rows.map((row) => {
      const name = (row.name as Record<string, string>) ?? {};
      return {
        ...row,
        id: String((row as Record<string, unknown>)._id),
        name_en: name.en ?? row.slug,
        name_fr: name.fr ?? name.en ?? row.slug,
        name_nl: name.nl ?? name.en ?? row.slug,
      };
    });
    return NextResponse.json({ breeds });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
