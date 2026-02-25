"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser, onSessionUserUpdate } from "@/lib/user-session";

export default function Footer() {
  const year = new Date().getFullYear();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <footer className="mt-12 border-t border-black/10 bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xl font-semibold">Blogify</h3>
            <p className="max-w-xs text-sm leading-7 text-foreground/70">
              Blogify is a modern platform for creating, sharing, and discovering
              stories from a growing community of writers and readers.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold">For readers</h4>
            <nav className="space-y-2 text-sm text-foreground/70">
              <Link href="/blogs" className="block hover:text-foreground transition-colors">
                Read blogs
              </Link>
              <Link href="/home" className="block hover:text-foreground transition-colors">
                Trending posts
              </Link>
              {!isLoggedIn && (
                <>
                  <Link href="/register" className="block hover:text-foreground transition-colors">
                    Join community
                  </Link>
                  <Link href="/login" className="block hover:text-foreground transition-colors">
                    Sign in
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold">About company</h4>
            <nav className="space-y-2 text-sm text-foreground/70">
              <Link href="/about" className="block hover:text-foreground transition-colors">
                About Blogify
              </Link>
              <Link href="/profile" className="block hover:text-foreground transition-colors">
                Authors
              </Link>
              <Link href="/blogs" className="block hover:text-foreground transition-colors">
                Latest stories
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-foreground/70">
              <p>+977 9803630789</p>
              <p>support@blogify.com</p>
              <p>@blogify (Instagram)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 py-4 text-center text-sm text-foreground/60">
        © {year} Blogify. All rights reserved.
      </div>
    </footer>
  );
}