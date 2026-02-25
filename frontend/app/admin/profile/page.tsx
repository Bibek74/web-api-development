"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

export default function AdminProfileRedirectPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const goToAdminProfile = async () => {
      router.replace("/admin");
    };

    goToAdminProfile();
  }, [router]);

  return (
    <div className="min-h-screen p-6">
      <div className={`mx-auto max-w-4xl rounded-xl p-12 text-center backdrop-blur-xl ${isDark ? "border border-white/10 bg-slate-800/50" : "border border-black/10 bg-white/85"}`}>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        <p className={`mt-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Opening profile...</p>
      </div>
    </div>
  );
}
