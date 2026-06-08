import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LocalizedText, UserLocale } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format EUR price from cents
export function formatPrice(cents: number, locale: string = "en"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(
    locale === "nl" ? "nl-BE" : locale === "fr" ? "fr-BE" : "en-BE",
    { style: "currency", currency: "EUR", minimumFractionDigits: 0 }
  ).format(amount);
}

// Get localized text value
export function getLocalizedText(
  text: LocalizedText | null | undefined,
  locale: UserLocale | string = "en"
): string {
  if (!text) return "";
  return text[locale as keyof LocalizedText] || text.en || "";
}

// Format age from weeks
export function formatAge(weeks: number, locale: string = "en"): string {
  if (weeks < 16) {
    const labels: Record<string, string> = { en: "weeks", fr: "semaines", nl: "weken" };
    return `${weeks} ${labels[locale] || labels.en}`;
  }
  const months = Math.round(weeks / 4.33);
  if (months < 24) {
    const labels: Record<string, string> = { en: "months", fr: "mois", nl: "maanden" };
    return `${months} ${labels[locale] || labels.en}`;
  }
  const years = Math.round(months / 12);
  const labels: Record<string, string> = { en: "years", fr: "ans", nl: "jaar" };
  return `${years} ${labels[locale] || labels.en}`;
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

// Get primary image from listing images array
export function getPrimaryImage(
  images: Array<{ url: string; is_primary: boolean }> | null | undefined
): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  return primary?.url || images[0]?.url || null;
}

// Format star rating
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Country name map
export const COUNTRIES: Record<string, Record<string, string>> = {
  BE: { en: "Belgium", fr: "Belgique", nl: "België" },
  NL: { en: "Netherlands", fr: "Pays-Bas", nl: "Nederland" },
  LU: { en: "Luxembourg", fr: "Luxembourg", nl: "Luxemburg" },
};

export function getCountryName(code: string, locale: string = "en"): string {
  return COUNTRIES[code]?.[locale] || code;
}

// Debounce
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
