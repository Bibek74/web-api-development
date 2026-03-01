"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { useToast } from "@/lib/toast";
import { buildProfileImageUrl } from "@/lib/user-session";
import { useTheme } from "@/lib/theme";

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  profileImage?: string;
  postsCount?: number;
  createdAt?: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function AdminUsersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const toast = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchUsers = async (page = 1) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/users?page=${page}&limit=${pagination.limit}`);
      setUsers(res.data?.data ?? []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    const shouldDelete = await toast.confirm(`Are you sure you want to delete user "${userName}"?`, "Delete User");
    if (!shouldDelete) return;

    try {
      const res = await axiosInstance.delete(`/api/admin/users/${userId}`);
      if (res.data?.success) {
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      toast.error(serverMsg || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-users-page container mx-auto px-4 py-8 max-w-7xl">
      <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-6 ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Admin Users</h1>

          <div className="flex gap-3">
            <button
              onClick={() => fetchUsers(pagination.page)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isDark ? "bg-zinc-800 text-slate-100 border border-white/15 hover:bg-zinc-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <Link
              href="/admin/users/create"
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200 shadow-lg shadow-amber-900/20" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search current page users by name/email/role"
            className={`w-full md:w-96 px-3 py-2 rounded-lg ${isDark ? "bg-black/50 border border-white/15 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder:text-slate-500"}`}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-300/20 border-t-amber-300"></div>
          </div>
        )}

        {error && (
          <div className={`px-4 py-3 rounded-lg mb-4 ${isDark ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-red-500/10 border border-red-500/25 text-red-700"}`}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? "border-b-2 border-white/20" : "border-b-2 border-black/15"}>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Role</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Blogs</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>ID</th>
                  <th className={`text-right py-3 px-4 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`text-center py-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className={isDark ? "border-b border-white/10 hover:bg-zinc-800/40" : "border-b border-black/10 hover:bg-slate-100/70"}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden bg-linear-to-br from-zinc-700 to-zinc-900 ring-1 ring-amber-200/30 flex items-center justify-center text-amber-100 text-sm font-semibold">
                            {u.profileImage ? (
                              <img
                                src={buildProfileImageUrl(u.profileImage)}
                                alt={u.name || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{u.name?.[0]?.toUpperCase() || "U"}</span>
                            )}
                          </div>
                          <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{u.name ?? "-"}</div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{u.email ?? "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-amber-200/10 text-amber-100 border border-amber-200/30"
                              : "bg-zinc-700/40 text-slate-200 border border-white/20"
                          }`}
                        >
                          {u.role ?? "-"}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {u.postsCount ?? 0}
                      </td>
                      <td className={`py-3 px-4 text-sm font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {u._id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/${u._id}`}
                            className={`px-3 py-1 rounded transition-colors text-sm ${isDark ? "bg-zinc-700 text-slate-100 hover:bg-zinc-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/${u._id}/edit`}
                            className={`px-3 py-1 rounded transition-colors text-sm ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200" : "bg-yellow-600 text-white hover:bg-yellow-700"}`}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(u._id, u.name || "this user")}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <>
            <div className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Showing <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{users.length}</span> users on page{" "}
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{pagination.page}</span> of{" "}
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{pagination.totalPages}</span>
              {" · "}
              Total users: <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{pagination.totalUsers}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className={`px-3 py-2 rounded-lg disabled:opacity-50 ${isDark ? "bg-zinc-800 border border-white/15 text-slate-100" : "bg-slate-200 text-slate-900"}`}
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className={`px-3 py-2 rounded-lg disabled:opacity-50 ${isDark ? "bg-zinc-800 border border-white/15 text-slate-100" : "bg-slate-200 text-slate-900"}`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
