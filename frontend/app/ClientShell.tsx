"use client";

import { usePathname } from "next/navigation";
import Header from "./(navigation)/Header";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideHeader = pathname.startsWith("/admin");

  if (hideHeader) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {/* Header is fixed, so push content down */}
      <main className="pt-0">{children}</main>
    </>
  );
}
