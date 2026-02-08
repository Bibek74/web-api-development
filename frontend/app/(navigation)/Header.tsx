"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check if user is logged in by checking cookies
    const checkAuth = () => {
      const userCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("user="));
      
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
          setIsLoggedIn(true);
          setUserName(userData.name || "User");
        } catch (error) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    // Clear all auth cookies
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setIsLoggedIn(false);
    router.push("/login");
  };

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
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <span className="text-sm text-white/80 hidden sm:inline">
                Welcome, {userName}
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
