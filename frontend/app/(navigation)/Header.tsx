import Link from "next/link";

export default function Header() {
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
          <Link href="/login" className="h-9 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20">
            Log in
          </Link>

          <Link href="/register" className="h-9 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20">
            Sign up
          </Link>
        </div>

      </div>
    </header>
  );
}
