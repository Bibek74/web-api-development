"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./(navigation)/Header";
import Footer from "./(navigation)/Footer";
import { ToastProvider } from "@/lib/toast";
import ThemeToggle from "./(navigation)/ThemeToggle";
import { getSessionUser, onSessionUserUpdate, SessionUser } from "@/lib/user-session";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setSessionUser(getSessionUser());
    };

    syncUser();
    const cleanup = onSessionUserUpdate(syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      cleanup();
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  const hideProfileHeaderForAdmin = pathname === "/profile" && sessionUser?.role === "admin";
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/logout";

  const hideHeader = pathname.startsWith("/admin") || pathname === "/blogs" || hideProfileHeaderForAdmin || isAuthRoute;
  const hideFooter = pathname.startsWith("/admin") || isAuthRoute;
  const hideThemeToggle = isAuthRoute;

  return (
    <ToastProvider>
      {hideHeader ? (
        children
      ) : (
        <>
          <Header />
          <main className="pt-0">{children}</main>
        </>
      )}
      {!hideFooter && <Footer />}
      {!hideThemeToggle && <ThemeToggle />}
    </ToastProvider>
  );
}
