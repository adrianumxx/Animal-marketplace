"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      const saved = localStorage.getItem("pawtrust-theme");
      const dark = saved !== "light";
      setIsDark(dark);
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    });
  }, []);

  function toggle() {
    const newDark = !isDark;
    setIsDark(newDark);
    const theme = newDark ? "dark" : "light";
    localStorage.setItem("pawtrust-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 group overflow-hidden"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(26,22,20,0.12)",
        color: isDark ? "var(--t-text)" : "var(--t-text)",
      }}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: isDark ? 1 : 0, transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(90deg)" }}
      >
        <Sun size={15} strokeWidth={2} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: isDark ? 0 : 1, transform: isDark ? "scale(0.5) rotate(-90deg)" : "scale(1) rotate(0deg)" }}
      >
        <Moon size={15} strokeWidth={2} />
      </span>
    </button>
  );
}
