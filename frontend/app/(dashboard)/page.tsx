import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">

        <h1 className="mb-4 text-4xl font-bold md:text-6xl">
          Welcome to <span className="text-red-600">Blogify</span>
        </h1>

        <p className="mb-8 max-w-xl text-white/70">
          Your one-stop destination for movies, shows, and cinematic experiences.
        </p>

        <div className="flex gap-4">
          <Link
            href="/home"
            className="rounded-md bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-700"
          >
            Enter Home
          </Link>

          <Link
            href="/login"
            className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10"
          >
            Login
          </Link>
        </div>

      </div>
    </main>
  );
}
