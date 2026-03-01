"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast";
import { useTheme } from "@/lib/theme";
import {
  buildProfileImageUrl,
  clearSessionCookies,
  getSessionUser,
  onSessionUserUpdate,
  SessionUser,
} from "@/lib/user-session";

export default function Header() {
  const router = useRouter();
  const toast = useToast();
  const pathname = usePathname();
  const { theme, mounted } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = !mounted || theme === "dark";
  const navItems = [
    { href: "/home", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blogs", label: "Blogs" },
  ];

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

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const shouldLogout = await toast.confirm("Are you sure you want to log out?", "Logout");
    if (!shouldLogout) return;

    clearSessionCookies();
    setUser(null);
    setIsLoggedIn(false);
    router.push("/login");
  };

  const profileImageUrl = buildProfileImageUrl(user?.profileImage);
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";
  const profileHref = user?.role === "admin" ? "/admin" : "/profile";
  const isActive = (href: string) => pathname === href;

  const headerSurfaceClass = isScrolled
    ? isDark
      ? "border-b border-white/10 bg-black/80 shadow-lg backdrop-blur-xl"
      : "border-b border-slate-300/70 bg-white/90 shadow-sm backdrop-blur-xl"
    : "bg-transparent";

  const navContainerClass = isDark
    ? "border border-white/15 bg-zinc-900/75 text-white/80"
    : "border border-slate-300/70 bg-white/85 text-slate-700";

  const profileChipClass = isDark
    ? "border border-amber-100/30 bg-zinc-900/70 text-amber-100 hover:bg-amber-200 hover:text-slate-950"
    : "border border-slate-300/70 bg-white/85 text-slate-800 hover:bg-slate-100";

  const secondaryButtonClass = isDark
    ? "border border-white/15 bg-zinc-900/70 text-slate-100 hover:bg-zinc-800"
    : "border border-slate-300/70 bg-white/85 text-slate-800 hover:bg-slate-100";

  const primaryButtonClass = isDark
    ? "border border-amber-200 bg-amber-300 text-slate-950 hover:bg-amber-200"
    : "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700";

  const mobilePanelClass = isDark
    ? "border border-white/10 bg-zinc-950/95"
    : "border border-slate-300/70 bg-white/95";

  const mobileLinkClass = isDark
    ? "border border-white/10 bg-zinc-900/70 text-slate-100 hover:bg-zinc-800"
    : "border border-slate-300/70 bg-slate-50 text-slate-800 hover:bg-slate-100";

  const navTextClass = (href: string) => {
    if (isDark) {
      return isActive(href) ? "text-amber-100" : "text-slate-300 hover:text-white";
    }
    return isActive(href) ? "text-slate-900" : "text-slate-600 hover:text-slate-900";
  };

  const activeDotClass = isDark ? "bg-amber-200" : "bg-slate-900";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${headerSurfaceClass}`}>
      <div className="relative mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-5">

        {/* Logo */}
        <Link href="/" className="mr-auto pl-1">
          <Image
            src="/blogify-logo-final.png"
            alt="Blogify"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Centered Nav (Desktop) */}
        <nav className={`absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-5 rounded-full px-5 py-1.5 text-sm backdrop-blur-md ${navContainerClass}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-1 font-semibold tracking-wide transition-colors ${navTextClass(item.href)}`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className={`absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full ${activeDotClass}`} />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="ml-auto hidden md:flex items-center gap-2 pr-1">
          {isLoggedIn ? (
            <>
              <Link
                href={profileHref}
                className={`h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors ${profileChipClass}`}
                title="My Profile"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name || "Profile"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">{userInitial}</span>
                )}
              </Link>
              <span className={`text-sm font-medium tracking-wide ${isDark ? "text-white/85" : "text-slate-700"}`}>
                Welcome, {user?.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className={`h-9 inline-flex items-center justify-center rounded-lg px-3.5 text-sm font-semibold tracking-wide transition-colors ${secondaryButtonClass}`}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`h-9 inline-flex items-center justify-center rounded-lg px-3.5 text-sm font-semibold tracking-wide transition-colors ${secondaryButtonClass}`}>
                Log in
              </Link>

              <Link href="/register" className={`h-9 inline-flex items-center justify-center rounded-lg px-3.5 text-sm font-semibold tracking-wide transition-colors ${primaryButtonClass}`}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg transition-colors ${secondaryButtonClass}`}
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className={`absolute top-[3.8rem] left-4 right-4 rounded-2xl p-4 shadow-lg backdrop-blur-xl md:hidden ${mobilePanelClass}`}>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition-colors ${mobileLinkClass} ${isActive(item.href) ? (isDark ? "ring-2 ring-amber-200/60" : "ring-2 ring-blue-500/60") : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={`mt-3 pt-3 flex flex-col gap-2 ${isDark ? "border-t border-white/10" : "border-t border-slate-300/70"}`}>
              {isLoggedIn ? (
                <>
                  <Link href={profileHref} className={`rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition-colors ${mobileLinkClass}`}>
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`h-9 rounded-lg px-4 text-sm font-semibold tracking-wide transition-colors ${secondaryButtonClass}`}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={`h-9 inline-flex items-center justify-center rounded-lg px-4 text-sm font-semibold tracking-wide transition-colors ${secondaryButtonClass}`}>
                    Log in
                  </Link>
                  <Link href="/register" className={`h-9 inline-flex items-center justify-center rounded-lg px-4 text-sm font-semibold tracking-wide transition-colors ${primaryButtonClass}`}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
