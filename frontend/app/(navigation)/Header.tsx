"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  buildProfileImageUrl,
  clearSessionCookies,
  getSessionUser,
  onSessionUserUpdate,
  SessionUser,
} from "@/lib/user-session";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const sessionUser = getSessionUser();
      setUser(sessionUser);
      setIsLoggedIn(!!sessionUser);
    };

    checkAuth();

    const cleanup = onSessionUserUpdate(checkAuth);
    window.addEventListener("focus", checkAuth);

    return () => {
      cleanup();
      window.removeEventListener("focus", checkAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    clearSessionCookies();
    setUser(null);
    setIsLoggedIn(false);
    router.push("/login");
  };

  const profileImageUrl = buildProfileImageUrl(user?.profileImage);
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center px-4">

        {/* Logo */}
        <Link href="/" className="font-semibold text-white mr-auto pl-2">
          Blogify
        </Link>

        {/* Centered Nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 rounded-full border border-white/15 bg-white/10 px-6 py-2 text-sm text-white/80 backdrop-blur-md">
          <Link href="/home" className="hover:text-white transition">Home</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/blogs" className="hover:text-white transition">Blogs</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="ml-auto flex items-center gap-3 pr-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                title="My Profile"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name || "Profile"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-semibold">{userInitial}</span>
                )}
              </Link>
              <span className="text-sm text-white/80 hidden sm:inline">
                Welcome, {user?.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="h-9 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="h-9 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20">
                Log in
              </Link>

              <Link href="/register" className="h-9 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20">
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
