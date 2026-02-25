"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`fixed bottom-5 right-5 z-100 h-12 w-12 rounded-full shadow-lg backdrop-blur-md transition-colors inline-flex items-center justify-center ${
        isDark
          ? "border border-white/20 bg-slate-900/80 text-white hover:bg-slate-800"
          : "border border-slate-300/80 bg-white/90 text-slate-900 hover:bg-slate-100"
      }`}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
    >
      <span className="text-lg leading-none">{mounted ? (isDark ? "☀️" : "🌙") : "◐"}</span>
    </button>
  );
}
