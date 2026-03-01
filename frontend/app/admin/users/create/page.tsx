"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { useTheme } from "@/lib/theme";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ✅ Use FormData even if no image
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (image) formData.append("image", image);

      // ✅ IMPORTANT: send token in Authorization header
      // token is stored as httpOnly cookie, so client JS can't read it.
      // So for now: simplest is to also store a non-httpOnly token cookie OR store token in localStorage.
      // If you haven't done that, create a Next API route proxy (I'll give you if needed).

      const res = await axiosInstance.post("/api/admin/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data?.message || "User created");
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setImage(null);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Create New User
        </h1>
        <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Add a new user to the system</p>
      </div>

      <div className={`backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
        <div className={`p-6 ${isDark ? "bg-zinc-900/85 border-b border-white/10" : "bg-slate-50 border-b border-black/10"}`}>
          <h2 className="text-xl font-bold">User Information</h2>
          <p className={`${isDark ? "text-slate-300" : "text-slate-600"} text-sm mt-1`}>Fill in the details below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-lg transition-all ${isDark ? "bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-lg transition-all ${isDark ? "bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Password <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg transition-all ${isDark ? "bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                User Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
                className={`w-full px-4 py-3 rounded-lg transition-all appearance-none ${isDark ? "bg-black/50 border border-white/15 text-white focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60"}`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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

            {message && (
              <div className={`rounded-lg p-4 ${message.includes("created") || message.includes("success") ? "bg-green-500/10 border border-green-500/20 text-green-300" : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2 ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200 disabled:bg-zinc-600" : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600"}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating User...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
