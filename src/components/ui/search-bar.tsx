"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  locale: string;
  variant: "navbar" | "hero";
}

const speciesOptions = [
  { value: "", label: "Any species" },
  { value: "dogs", label: "Dogs" },
  { value: "cats", label: "Cats" },
  { value: "rabbits", label: "Rabbits" },
  { value: "birds", label: "Birds" },
  { value: "horses", label: "Horses" },
  { value: "exotic", label: "Exotic" },
];

const ageOptions = [
  { value: "", label: "Any age" },
  { value: "0-12", label: "0-12 weeks" },
  { value: "13-26", label: "3-6 months" },
  { value: "27-52", label: "6-12 months" },
  { value: "53-", label: "1 year+" },
];

function buildSearchUrl(locale: string, query: string, species: string, age: string) {
  const params = new URLSearchParams();
  const cleanQuery = query.trim();
  if (cleanQuery) params.set("q", cleanQuery);
  if (species) params.set("species", species);
  if (age) {
    const [min, max] = age.split("-");
    if (min) params.set("min_age", min);
    if (max) params.set("max_age", max);
  }
  const suffix = params.toString();
  return `/${locale}/search${suffix ? `?${suffix}` : ""}`;
}

export function SearchBar({ locale, variant }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState("");
  const [age, setAge] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildSearchUrl(locale, query, species, age));
  };

  if (variant === "navbar") {
    return (
      <form onSubmit={submit} className="hidden min-[1440px]:flex items-center search-bar-nav group">
        <label className="search-bar-nav-field search-bar-nav-query">
          <span className="sr-only">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="search-bar-nav-input"
          />
        </label>
        <span className="search-bar-nav-sep block" />
        <label className="search-bar-nav-field">
          <span className="sr-only">Species</span>
          <select value={species} onChange={(event) => setSpecies(event.target.value)} className="search-bar-nav-select">
            {speciesOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <span className="search-bar-nav-sep block" />
        <label className="search-bar-nav-field">
          <span className="sr-only">Age</span>
          <select value={age} onChange={(event) => setAge(event.target.value)} className="search-bar-nav-select search-bar-nav-muted">
            {ageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="search-bar-nav-btn flex items-center justify-center" aria-label="Search listings">
          <Search size={14} strokeWidth={2.5} />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-stretch w-full max-w-[720px] search-bar-hero group">
      <label className="flex-[1.2] flex flex-col justify-center px-5 py-3.5 search-bar-hero-divider min-w-0">
        <span className="search-bar-hero-label">Search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Breed, city, keyword"
          className="search-bar-hero-input"
        />
      </label>
      <label className="flex-1 hidden sm:flex flex-col justify-center px-5 py-3.5 search-bar-hero-divider">
        <span className="search-bar-hero-label">Species</span>
        <select value={species} onChange={(event) => setSpecies(event.target.value)} className="search-bar-hero-select">
          {speciesOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="flex-1 hidden md:flex flex-col justify-center px-5 py-3.5">
        <span className="search-bar-hero-label">Age</span>
        <select value={age} onChange={(event) => setAge(event.target.value)} className="search-bar-hero-select">
          {ageOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="flex items-center px-2.5 py-2">
        <button type="submit" className="search-bar-hero-btn inline-flex items-center gap-2">
          <Search size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
