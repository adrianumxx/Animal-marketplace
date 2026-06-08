import { cn } from "@/lib/utils";

interface BreedTagProps {
  species: string;
  breed?: string;
  className?: string;
}

const speciesColors: Record<string, string> = {
  dogs: "bg-orange-50 text-orange-700 border-orange-200",
  cats: "bg-purple-50 text-purple-700 border-purple-200",
  rabbits: "bg-pink-50 text-pink-700 border-pink-200",
  birds: "bg-sky-50 text-sky-700 border-sky-200",
  horses: "bg-amber-50 text-amber-700 border-amber-200",
  exotic: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function BreedTag({ species, breed, className }: BreedTagProps) {
  const colorClass = speciesColors[species] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {breed || species}
    </span>
  );
}
