import type { MetadataRoute } from "next";
import { getSpeciesList, getBreedSlugs } from "@/lib/public-data";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LOCALES = ["en", "fr", "nl"];
const STATIC = ["", "/search", "/breeders", "/shelters", "/vets", "/pricing", "/how-it-works"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [species, breeds] = await Promise.all([getSpeciesList(), getBreedSlugs()]);
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC) {
      urls.push({ url: `${BASE}/${locale}${path}`, changeFrequency: "daily", priority: path === "" ? 1 : 0.7 });
    }
    for (const s of species) {
      urls.push({ url: `${BASE}/${locale}/species/${s.slug}`, changeFrequency: "daily", priority: 0.8 });
    }
    for (const slug of breeds) {
      urls.push({ url: `${BASE}/${locale}/breeds/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }
  return urls;
}
