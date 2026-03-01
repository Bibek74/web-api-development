"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { useToast } from "@/lib/toast";
import { buildProfileImageUrl } from "@/lib/user-session";
import { useTheme } from "@/lib/theme";

type UserDTO = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  profileImage?: string;
  createdAt?: string;
};

export default function AdminUserByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const fetchUser = async (userId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/users/${userId}`);
      setUser(res.data?.data ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const shouldDelete = await toast.confirm("Are you sure you want to delete this user?", "Delete User");
    if (!shouldDelete) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`);
      toast.success("User deleted successfully!");
      router.push("/admin/users");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-6 ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Details
            </h1>
            <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>View and manage user information</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {id && !loading && user && (
              <>
                <Link 
                  href={`/admin/${id}/edit`} 
                  className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
            <Link 
              href="/admin/users"
              className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${isDark ? "bg-zinc-800 border border-white/15 text-slate-100 hover:bg-zinc-700" : "bg-white border border-black/15 text-slate-700 hover:bg-slate-100"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Users
            </Link>
          </div>
        </div>

        {loading && (
          <div className={`rounded-2xl border p-12 text-center ${isDark ? "border-white/10 bg-zinc-900/70" : "border-black/10 bg-white/85"}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-300/20 border-t-amber-300 mx-auto"></div>
            <p className={`mt-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Loading user details...</p>
          </div>
        )}

        {error && (
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${isDark ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-red-500/25 bg-red-500/10 text-red-700"}`}>
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold">Error Loading User</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && user && (
          <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/10 bg-zinc-900/70" : "border-black/10 bg-white/85"}`}>
            <div className={`p-6 ${isDark ? "border-b border-white/10 bg-zinc-900/85" : "border-b border-black/10 bg-slate-50"}`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-3xl font-bold ring-2 ring-amber-200/30 overflow-hidden text-amber-100">
                  {user.profileImage ? (
                    <img
                      src={buildProfileImageUrl(user.profileImage)}
                      alt={user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user.name || "Unknown User"}</h2>
                  <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{user.email || "-"}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Account Information</h3>
              <div className="space-y-4">
                <div className={`flex items-start pb-4 ${isDark ? "border-b border-white/10" : "border-b border-black/10"}`}>
                  <div className="w-1/3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>User ID</p>
                  </div>
                  <div className="w-2/3">
                    <p className={`font-mono text-sm px-3 py-1 rounded inline-block ${isDark ? "text-slate-200 bg-slate-900/50 border border-white/10" : "text-slate-700 bg-slate-100 border border-black/10"}`}>
                      {user._id}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start pb-4 ${isDark ? "border-b border-white/10" : "border-b border-black/10"}`}>
                  <div className="w-1/3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>Full Name</p>
                  </div>
                  <div className="w-2/3">
                    <p className={`text-lg font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{user.name || "-"}</p>
                  </div>
                </div>

                <div className={`flex items-start pb-4 ${isDark ? "border-b border-white/10" : "border-b border-black/10"}`}>
                  <div className="w-1/3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>Email Address</p>
                  </div>
                  <div className="w-2/3">
                    <p className={`${isDark ? "text-slate-200" : "text-slate-700"}`}>{user.email || "-"}</p>
                  </div>
                </div>

                <div className={`flex items-start pb-4 ${isDark ? "border-b border-white/10" : "border-b border-black/10"}`}>
                  <div className="w-1/3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>Role</p>
                  </div>
                  <div className="w-2/3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${
                      user.role === "admin" 
                        ? isDark
                          ? "bg-amber-200/10 text-amber-100 border border-amber-200/30"
                          : "bg-blue-100 text-blue-700 border border-blue-300"
                        : isDark
                          ? "bg-slate-700/50 text-slate-300 border border-slate-600/30"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                    }`}>
                      {user.role || "user"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-1/3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>Created At</p>
                  </div>
                  <div className="w-2/3">
                    <p className={`${isDark ? "text-slate-200" : "text-slate-700"}`}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
