"use client";

import { usePathname } from "next/navigation";
import Header from "./(navigation)/Header";
import Footer from "./(navigation)/Footer";
import { ToastProvider } from "@/lib/toast";
import ThemeToggle from "./(navigation)/ThemeToggle";
import { getSessionUser } from "@/lib/user-session";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sessionUser = getSessionUser();
  const hideProfileHeaderForAdmin = pathname === "/profile" && sessionUser?.role === "admin";

  const hideHeader = pathname.startsWith("/admin") || pathname === "/blogs" || hideProfileHeaderForAdmin;
  const hideFooter = pathname.startsWith("/admin");

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
      <ThemeToggle />
    </ToastProvider>
  );
}
