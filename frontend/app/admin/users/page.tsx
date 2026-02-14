"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
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
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      const res = await axiosInstance.delete(`/api/admin/users/${userId}`);
      if (res.data?.success) {
        alert("User deleted successfully!");
        fetchUsers();
      }
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      alert(serverMsg || "Failed to delete user");
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Users</h1>

          <div className="flex gap-3">
            <button
              onClick={() => fetchUsers(pagination.page)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <Link
              href="/admin/users/create"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
            className="w-full md:w-96 px-3 py-2 rounded-md bg-slate-900/50 border border-white/15 text-white placeholder:text-slate-400"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-white/20">
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">ID</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-white/10 hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{u.name ?? "-"}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.email ?? "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {u.role ?? "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm font-mono">
                        {u._id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/${u._id}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/${u._id}/edit`}
                            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
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
            <div className="mt-4 text-sm text-slate-300">
              Showing <span className="font-semibold text-white">{users.length}</span> users on page{" "}
              <span className="font-semibold text-white">{pagination.page}</span> of{" "}
              <span className="font-semibold text-white">{pagination.totalPages}</span>
              {" · "}
              Total users: <span className="font-semibold text-white">{pagination.totalUsers}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="px-3 py-2 rounded bg-slate-700 text-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="px-3 py-2 rounded bg-slate-700 text-white disabled:opacity-50"
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
