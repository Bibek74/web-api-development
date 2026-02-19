"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { useEffect, useState } from "react";
import { profileApi } from "@/lib/api/profile";
import axiosInstance from "@/lib/api/axios";
import {
  buildProfileImageUrl,
  clearSessionCookies,
  getSessionUser,
  onSessionUserUpdate,
  SessionUser,
} from "@/lib/user-session";

type AdminUserStat = {
  _id: string;
  name?: string;
  postsCount?: number;
  posts?: string[];
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [showBlogStats, setShowBlogStats] = useState(false);
  const [blogStats, setBlogStats] = useState<Array<{ _id: string; name: string; postsCount: number }>>([]);

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const sessionUser = getSessionUser();
      if (mounted) {
        setUser(sessionUser);
      }

      try {
        const response = await profileApi.getMyProfile();
        if (response.success && response.result && mounted) {
          setUser({
            _id: response.result._id,
            name: response.result.name,
            email: response.result.email,
            role: response.result.role,
            profileImage: response.result.profileImage || "",
          });
        }
      } catch {
      }

      try {
        const usersResponse = await axiosInstance.get("/api/admin/users?page=1&limit=100");
        const users: AdminUserStat[] = usersResponse.data?.data || [];

        if (mounted) {
          setBlogStats(
            users
              .map((item) => ({
                _id: item._id,
                name: item.name || "Unknown User",
                postsCount: typeof item.postsCount === "number"
                  ? item.postsCount
                  : Array.isArray(item.posts)
                    ? item.posts.length
                    : 0,
              }))
              .sort((a, b) => b.postsCount - a.postsCount)
          );
        }
      } catch {
      }
    };

    syncUser();
    const cleanup = onSessionUserUpdate(() => {
      syncUser();
    });

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  const handleLogout = async () => {
    const shouldLogout = await toast.confirm("Are you sure you want to log out?", "Logout");
    if (!shouldLogout) return;

    clearSessionCookies();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <aside className="relative w-64 bg-linear-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-r border-white/10 text-white p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          </div>
          <p className="text-xs text-slate-400">Management Dashboard</p>
        </div>

        <Link
          href="/profile"
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-slate-900/40 hover:bg-white/10 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/15 overflow-hidden flex items-center justify-center text-sm font-semibold text-white">
            {user?.profileImage ? (
              <img
                src={buildProfileImageUrl(user.profileImage)}
                alt={user.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{user?.name || "My Profile"}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role?.toUpperCase() || "USER"}</p>
          </div>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/15 overflow-hidden flex items-center justify-center text-xs font-semibold text-white">
              {user?.profileImage ? (
                <img
                  src={buildProfileImageUrl(user.profileImage)}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">My Profile</p>
              <p className="text-xs text-slate-400 truncate">{user?.name || "Open profile"}</p>
            </div>
          </Link>

          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Users</span>
          </Link>
          <Link 
            href="/admin/users/create" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="font-medium">Create User</span>
          </Link>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowBlogStats((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg border border-white/10 bg-slate-900/40 hover:bg-white/10 transition-all duration-200"
            >
              <span className="text-sm font-semibold text-slate-200">Blogs Posted by User</span>
              <span className="text-xs text-slate-300">{showBlogStats ? "▾" : "▸"}</span>
            </button>

            {showBlogStats && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/40 p-2 space-y-1">
                {blogStats.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-slate-400">No user blog stats available.</p>
                ) : (
                  blogStats.map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-white/5">
                      <span className="truncate pr-2 text-slate-300">{item.name}</span>
                      <span className="font-semibold text-blue-300 whitespace-nowrap">{item.postsCount}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-300 font-medium">Admin Access</p>
            <p className="text-xs text-slate-500 mt-1">Full Control</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
