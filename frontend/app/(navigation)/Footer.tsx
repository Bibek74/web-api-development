"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser, onSessionUserUpdate } from "@/lib/user-session";
import { useTheme } from "@/lib/theme";

export default function Footer() {
  const year = new Date().getFullYear();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme, mounted } = useTheme();
  const isDark = !mounted || theme === "dark";

  const footerSurfaceClass = isDark
    ? "mt-12 border-t border-white/10 bg-linear-to-b from-black via-zinc-950 to-slate-950 text-slate-100"
    : "mt-12 border-t border-black/10 bg-background text-foreground";

  const subTextClass = isDark ? "text-slate-400" : "text-foreground/70";
  const linkClass = isDark
    ? "block text-slate-400 hover:text-amber-100 transition-colors"
    : "block text-foreground/70 hover:text-foreground transition-colors";

  const bottomBorderClass = isDark ? "border-t border-white/10" : "border-t border-black/10";
  const bottomTextClass = isDark ? "text-slate-500" : "text-foreground/60";

  useEffect(() => {
    const hasCookie = (name: string) =>
      document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith(`${name}=`) && cookie.split("=")[1]);

    const checkAuth = () => {
      const sessionUser = getSessionUser();
      const hasToken = hasCookie("auth_token");
      setIsLoggedIn(!!sessionUser || hasToken);
    };

    checkAuth();

    const cleanup = onSessionUserUpdate(checkAuth);
    window.addEventListener("focus", checkAuth);

    return () => {
      cleanup();
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  return (
    <footer className={`${footerSurfaceClass} transition-colors duration-300`}>
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xl font-semibold">Blogify</h3>
            <p className={`max-w-xs text-sm leading-7 ${subTextClass}`}>
              Blogify is a modern platform for creating, sharing, and discovering
              stories from a growing community of writers and readers.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold">For readers</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/blogs" className={linkClass}>
                Read blogs
              </Link>
              <Link href="/home" className={linkClass}>
                Trending posts
              </Link>
              {!isLoggedIn && (
                <>
                  <Link href="/register" className={linkClass}>
                    Join community
                  </Link>
                  <Link href="/login" className={linkClass}>
                    Sign in
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold">About company</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/about" className={linkClass}>
                About Blogify
              </Link>
              <Link href="/profile" className={linkClass}>
                Authors
              </Link>
              <Link href="/blogs" className={linkClass}>
                Latest stories
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold">Contact</h4>
            <div className={`space-y-2 text-sm ${subTextClass}`}>
              <p>+977 9803630789</p>
              <p>support@blogify.com</p>
              <p>@blogify (Instagram)</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${bottomBorderClass} py-4 text-center text-sm ${bottomTextClass}`}>
        © {year} Blogify. All rights reserved.
      </div>
    </footer>
  );
}