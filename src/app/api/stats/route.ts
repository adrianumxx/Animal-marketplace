import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/public-data";

export async function GET() {
  const stats = await getPlatformStats();
  return NextResponse.json(stats);
}
