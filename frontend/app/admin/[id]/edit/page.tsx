"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { useTheme } from "@/lib/theme";

type UserDTO = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  profileImage?: string;
  createdAt?: string;
};

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [user, setUser] = useState<UserDTO | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === "object" && err !== null) {
      const maybeResponse = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return maybeResponse.response?.data?.message || maybeResponse.message || fallback;
    }
    return fallback;
  };

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      name !== (user.name ?? "") ||
      email !== (user.email ?? "") ||
      role !== (user.role ?? "user") ||
      password.length > 0 ||
      !!image
    );
  }, [user, name, email, role, password, image]);

  const fetchUser = useCallback(async (userId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/users/${userId}`);
      const u: UserDTO | undefined = res.data?.data;
      if (!u) throw new Error("User not found");

      setUser(u);
      setName(u.name ?? "");
      setEmail(u.email ?? "");
      setRole(u.role ?? "user");
      setPassword("");
      setImage(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load user"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return; // wait until params are available
    fetchUser(id);
  }, [id, fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role", role);
      if (password.trim()) formData.append("password", password.trim());
      if (image) formData.append("image", image);

      const res = await axiosInstance.put(`/api/admin/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data?.data as UserDTO | undefined;
      if (updated) {
        setUser(updated);
        setName(updated.name ?? "");
        setEmail(updated.email ?? "");
        setRole(updated.role ?? "user");
        setPassword("");
        setImage(null);
      } else {
        await fetchUser(id);
      }

      router.push(`/admin/${id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update user"));
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 flex items-center justify-center">
        <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-8 text-center ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-300/20 border-t-amber-300 mx-auto"></div>
          <p className={`mt-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Loading route params...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 flex items-center justify-center">
        <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-8 text-center ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-300/20 border-t-amber-300 mx-auto"></div>
          <p className={`mt-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-xl p-8 ${isDark ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-red-500/10 border border-red-500/25 text-red-700"}`}>
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-8 h-8 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">Error Loading User</h3>
                <p className="mt-1">User ID: {id}</p>
                <p className="mt-2">{error}</p>
              </div>
            </div>
            <button
              onClick={() => fetchUser(id)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 flex items-center justify-center">
        <div className={`backdrop-blur-xl rounded-xl shadow-lg p-8 text-center ${isDark ? "bg-zinc-900/65 border border-white/10" : "bg-white/85 border border-black/10"}`}>
          <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>User not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${isDark ? "bg-zinc-800 border border-white/15 text-slate-100 hover:bg-zinc-700" : "bg-white border border-black/15 text-slate-700 hover:bg-slate-100"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Users
          </button>
        </div>

        <div className="mb-6">
          <h1 className={`text-3xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit User
          </h1>
          <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Update user information and permissions</p>
          <p className={`text-sm mt-1 font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>ID: {id}</p>
        </div>

        <div className={`backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
          <div className={`p-6 ${isDark ? "bg-zinc-900/85 border-b border-white/10" : "bg-slate-50 border-b border-black/10"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ring-2 ${isDark ? "bg-zinc-900 text-amber-100 ring-amber-200/30" : "bg-slate-100 text-slate-800 ring-black/10"}`}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Editing: {user.name}</h2>
                <p className={`${isDark ? "text-slate-300" : "text-slate-600"} text-sm`}>{user.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all ${isDark ? "bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all ${isDark ? "bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  User Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "user" | "admin")}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all appearance-none ${isDark ? "bg-black/50 border border-white/15 text-white focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  New Password <span className={`${isDark ? "text-slate-500" : "text-slate-500"} font-normal`}>(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all ${isDark ? "bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Only fill this if you want to change the password</p>
              </div>

              <div>
                <label htmlFor="image" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Profile Image <span className={`${isDark ? "text-slate-500" : "text-slate-500"} font-normal`}>(Optional)</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${isDark ? "border-white/20 bg-black/40 hover:border-amber-200/40" : "border-black/15 bg-slate-50 hover:border-blue-400"}`}>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    className={`w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${isDark ? "text-slate-300 file:bg-amber-300 file:text-slate-950 hover:file:bg-amber-200" : "text-slate-700 file:bg-blue-600 file:text-white hover:file:bg-blue-700"}`}
                  />
                  {image && (
                    <p className={`text-sm mt-2 flex items-center gap-1 ${isDark ? "text-amber-200" : "text-blue-600"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selected: {image.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className={`rounded-lg p-4 flex items-start gap-3 ${isDark ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-red-500/10 border border-red-500/25 text-red-700"}`}>
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className={`flex flex-col sm:flex-row gap-3 pt-4 ${isDark ? "border-t border-white/10" : "border-t border-black/10"}`}>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/${id}`)}
                  className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${isDark ? "border border-white/20 text-slate-300 hover:bg-zinc-800" : "border border-black/15 text-slate-700 hover:bg-slate-100"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className={`flex-1 px-6 py-3 rounded-lg disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-md ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200 disabled:bg-zinc-600" : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"}`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {!hasChanges && !saving && (
                <p className={`text-sm text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>No changes to save</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
