"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";

type UserDTO = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  image?: string;
  createdAt?: string;
};

export default function AdminUserByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

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
    if (!id || !confirm("Are you sure you want to delete this user?")) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`);
      router.push("/admin/users");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete user");
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Details
            </h1>
            <p className="text-slate-300 mt-1">View and manage user information</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {id && !loading && user && (
              <>
                <Link 
                  href={`/admin/${id}/edit`} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md font-medium"
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
              className="px-4 py-2 bg-slate-700/50 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Users
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading user details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-300">Error Loading User</h3>
              <p className="text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* User Details Card */}
        {!loading && !error && user && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden border border-white/10">
            {/* User Header with Avatar */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold ring-4 ring-white/30">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name || "Unknown User"}</h2>
                  <p className="text-blue-100 mt-1">{user.email || "-"}</p>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start border-b border-white/10 pb-4">
                  <div className="w-1/3">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">User ID</p>
                  </div>
                  <div className="w-2/3">
                    <p className="text-slate-200 font-mono text-sm bg-slate-900/50 px-3 py-1 rounded border border-white/10 inline-block">
                      {user._id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start border-b border-white/10 pb-4">
                  <div className="w-1/3">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Full Name</p>
                  </div>
                  <div className="w-2/3">
                    <p className="text-white text-lg font-medium">{user.name || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start border-b border-white/10 pb-4">
                  <div className="w-1/3">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Email Address</p>
                  </div>
                  <div className="w-2/3">
                    <p className="text-slate-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {user.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start border-b border-white/10 pb-4">
                  <div className="w-1/3">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Role</p>
                  </div>
                  <div className="w-2/3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${
                      user.role === "admin" 
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                        : "bg-slate-700/50 text-slate-300 border border-slate-600/30"
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {user.role || "user"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-1/3">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Created At</p>
                  </div>
                  <div className="w-2/3">
                    <p className="text-slate-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                    </p>
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
