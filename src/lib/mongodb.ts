import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cache;

export function hasMongoConfig(): boolean {
  return Boolean(MONGODB_URI && !MONGODB_URI.includes("your-") && MONGODB_URI.startsWith("mongodb"));
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!hasMongoConfig()) {
    throw new Error("MONGODB_URI is not configured. Add it to .env.local.");
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
      dbName: "pawtrust",
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
