"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { api, type AppUser } from "@/lib/api-client";

interface AuthNavbarProps {
  locale: string;
  t: {
    browse: string;
    breeders: string;
    shelters: string;
    vets: string;
    pricing: string;
    login: string;
    register: string;
    dashboard: string;
    logout: string;
  };
}

export function AuthNavbar({ locale, t }: AuthNavbarProps) {
  const [user, setUser] = useState<AppUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("pt_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Refresh from the server so role and capabilities stay current.
    api.auth.me()
      .then((me) => {
        setUser(me);
        localStorage.setItem("pt_user", JSON.stringify(me));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("pt_user");
        localStorage.removeItem("pt_token");
      });
  }, [pathname]);

  async function logout() {
    try { await api.auth.logout(); } catch { /* */ }
    localStorage.removeItem("pt_token");
    localStorage.removeItem("pt_user");
    setUser(null);
    router.push(`/${locale}/login`);
  }

  return <Navbar locale={locale} t={t} user={user} onLogout={logout} />;
}
