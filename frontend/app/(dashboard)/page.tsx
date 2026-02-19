import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="relative min-h-screen text-white">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/img 4.png')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-black/90 via-zinc-900/85 to-black/90" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">

        <h1 className="mb-4 text-4xl font-bold md:text-6xl">
          Welcome to <span className="text-red-600">Blogify</span>
        </h1>

        <p className="mb-8 max-w-xl text-white/70">
          Your one-stop destination for Blogging experiences.
        </p>

        <div className="flex gap-4">
          <Link
            href="/home"
            className="rounded-md bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-700 transition"
          >
            Enter Home
          </Link>

          <Link
            href="/login"
            className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition"
          >
            Login
          </Link>
        </div>

      </div>
    </main>
  );
}
