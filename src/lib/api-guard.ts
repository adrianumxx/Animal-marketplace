import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientKey(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export function rateLimit(
  req: NextRequest,
  scope: string,
  { limit, windowMs }: { limit: number; windowMs: number }
) {
  const now = Date.now();
  const key = `${scope}:${clientKey(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;

  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
      },
    }
  );
}

export async function parseJson<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  try {
    const json = await req.json();
    return schema.parse(json);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: z.treeifyError(error) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
