"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { useTheme } from "@/lib/theme";

type AdminStatsResponse = {
  pagination?: {
    totalUsers?: number;
    totalPosts?: number;
  };
};

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get<AdminStatsResponse>("/api/admin/users?page=1&limit=1");
        const pagination = response.data?.pagination;
        setTotalUsers(pagination?.totalUsers ?? 0);
        setTotalPosts(pagination?.totalPosts ?? 0);
      } catch (err: unknown) {
        // @ts-expect-error - axios error shape
        const serverMsg = err?.response?.data?.message;
        setError(serverMsg || (err instanceof Error ? err.message : "Failed to load admin stats"));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const avgPostsPerUser = totalUsers > 0 ? (totalPosts / totalUsers).toFixed(1) : "0.0";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute left-1/4 top-1/4 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-blue-500/10" : "bg-blue-500/20"}`} />
        <div className={`absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-purple-500/10" : "bg-purple-500/20"}`} />
      </div>

      <div
        className={`relative w-full max-w-5xl rounded-3xl p-7 shadow-2xl backdrop-blur-2xl sm:p-8 ${
          isDark
            ? "border border-white/15 bg-slate-900/45"
            : "border border-black/10 bg-white/80"
        }`}
      >
        <h1 className="mb-8 bg-linear-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-center text-4xl font-extrabold text-transparent">
          Admin Overview
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        )}

        {error && !loading && (
          <div className={`mb-4 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl ${isDark ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-red-500/25 bg-red-500/10 text-red-700"}`}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div className={`rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-200 hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-slate-900/55" : "border-black/10 bg-white/85"}`}>
              <p className={`text-xs uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Users</p>
              <p className={`mt-3 text-4xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>{totalUsers}</p>
            </div>

            <div className={`rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-200 hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-slate-900/55" : "border-black/10 bg-white/85"}`}>
              <p className={`text-xs uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Posts</p>
              <p className={`mt-3 text-4xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>{totalPosts}</p>
            </div>

            <div className={`rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-200 hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-slate-900/55" : "border-black/10 bg-white/85"}`}>
              <p className={`text-xs uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Avg Posts/User</p>
              <p className={`mt-3 text-4xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>{avgPostsPerUser}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
