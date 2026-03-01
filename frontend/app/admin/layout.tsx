"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { useTheme } from "@/lib/theme";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pathname = usePathname();
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

  const navItemBaseClass = "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 group shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";
  const navItemInactiveClass = isDark
    ? "border-white/15 bg-zinc-900/70 hover:bg-zinc-800 shadow-black/35"
    : "border-black/15 bg-black/8 hover:bg-black/12 shadow-black/10";
  const navItemActiveClass = isDark
    ? "border-amber-200/40 bg-amber-200/12 text-amber-100 shadow-amber-900/20"
    : "border-black/20 bg-white/80 text-slate-900 shadow-slate-300/30";
  const navItemClass = (active: boolean) =>
    `${navItemBaseClass} ${active ? navItemActiveClass : navItemInactiveClass}`;

  const isUserDetailRoute =
    /^\/admin\/[^/]+(\/edit)?$/.test(pathname) &&
    !pathname.startsWith("/admin/users") &&
    pathname !== "/admin/blogs" &&
    pathname !== "/admin/profile";

  const usersSectionActive = pathname === "/admin/users" || isUserDetailRoute;

  return (
    <div
      className={`flex min-h-screen ${
        isDark
          ? "bg-linear-to-br from-black via-zinc-950 to-slate-950"
          : "bg-linear-to-br from-slate-100 via-white to-slate-100"
      }`}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-amber-200/8" : "bg-blue-500/20"}`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-yellow-100/6" : "bg-purple-500/20"}`}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-orange-200/6" : "bg-indigo-500/20"}`}></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`relative w-64 backdrop-blur-xl p-6 ${
          isDark
            ? "bg-linear-to-b from-zinc-900/70 to-black/70 border-r border-white/10 text-white"
            : "bg-linear-to-b from-white/80 to-slate-100/80 border-r border-slate-300/70 text-slate-900"
        }`}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-zinc-700 to-zinc-900 ring-1 ring-amber-200/30 rounded-lg flex items-center justify-center text-amber-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-linear-to-r from-amber-100 via-amber-300 to-yellow-100 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          </div>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-xs`}>Management Dashboard</p>
        </div>

        <Link
          href="/admin"
          className={`mb-4 ${navItemClass(pathname === "/admin")}`}
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
            className={navItemClass(pathname === "/profile")}
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
            className={navItemClass(usersSectionActive)}
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Users</span>
          </Link>
          <Link 
            href="/admin/users/create" 
            className={navItemClass(pathname === "/admin/users/create")}
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="font-medium">Create User</span>
          </Link>

          <Link 
            href="/admin/blogs" 
            className={navItemClass(pathname === "/admin/blogs")}
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.483 9.246 5 7.5 5S4.168 5.483 3 6.253v13C4.168 18.483 5.754 18 7.5 18s3.332.483 4.5 1.253m0-13C13.168 5.483 14.754 5 16.5 5s3.332.483 4.5 1.253v13C19.832 18.483 18.246 18 16.5 18s-3.332.483-4.5 1.253" />
            </svg>
            <span className="font-medium">Blogs</span>
          </Link>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowBlogStats((prev) => !prev)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl border transition-all duration-200 shadow-lg hover:-translate-y-0.5 ${showBlogStats ? navItemActiveClass : navItemInactiveClass}`}
            >
              <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>Blogs Posted by User</span>
              <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{showBlogStats ? "▾" : "▸"}</span>
            </button>

            {showBlogStats && (
              <div className={`mt-2 max-h-48 overflow-y-auto rounded-lg p-2 space-y-1 ${
                isDark
                  ? "border border-white/10 bg-slate-900/40"
                  : "border border-black/10 bg-white/75"
              }`}>
                {blogStats.length === 0 ? (
                  <p className={`px-2 py-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>No user blog stats available.</p>
                ) : (
                  blogStats.map((item) => (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs ${
                        isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                      }`}
                    >
                      <span className={`truncate pr-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{item.name}</span>
                      <span className={`font-semibold whitespace-nowrap ${isDark ? "text-amber-200" : "text-blue-700"}`}>{item.postsCount}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div
            className={`rounded-lg px-4 py-3 ${
              isDark
                ? "bg-linear-to-r from-amber-200/10 to-yellow-100/8 border border-amber-200/20"
                : "bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-black/10"
            }`}
          >
            <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Admin Access</p>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}>Full Control</p>
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
