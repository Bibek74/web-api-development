"use client";

import { usePathname } from "next/navigation";
import Header from "./(navigation)/Header";
import Footer from "./(navigation)/Footer";
import { ToastProvider } from "@/lib/toast";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideHeader = pathname.startsWith("/admin") || pathname === "/blogs";
  const hideFooter = pathname.startsWith("/admin");

  if (hideHeader) {
    return (
      <ToastProvider>
        {children}
        {!hideFooter && <Footer />}
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Header />
      {/* Header is fixed, so push content down */}
      <main className="pt-0">{children}</main>
      {!hideFooter && <Footer />}
    </ToastProvider>
  );
}
