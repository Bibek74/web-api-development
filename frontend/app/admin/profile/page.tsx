"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

export default function AdminProfileRedirectPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/admin");
  };

  useEffect(() => {
    const goToAdminProfile = async () => {
      router.replace("/admin");
    };

    goToAdminProfile();
  }, [router]);

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-linear-to-br from-black via-zinc-950 to-slate-950" : "bg-slate-50"}`}>
      <div className={`mx-auto max-w-4xl rounded-2xl p-12 text-center backdrop-blur-xl ${isDark ? "border border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40" : "border border-black/10 bg-white/85"}`}>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-amber-300/20 border-t-amber-300" />
        <p className={`mt-4 text-lg ${isDark ? "text-slate-300" : "text-slate-700"}`}>Opening profile...</p>
        <button
          type="button"
          onClick={handleBack}
          className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors ${
            isDark
              ? "border border-white/15 bg-zinc-900 text-slate-200 hover:bg-zinc-800"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
}
