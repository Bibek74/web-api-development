import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="mb-8 text-xl font-bold">Admin Panel</h2>

        <nav className="space-y-4 text-sm">
          <Link href="/admin/users" className="block hover:underline">
            Users
          </Link>
          <Link href="/admin/users/create" className="block hover:underline">
            Create User
          </Link>
        </nav>
      </aside>

      <main
        className="flex-1 p-8 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/authbackground.jpeg')",
        }}
      >
        <div className="min-h-full rounded-lg bg-black/80 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
