import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-white/10 bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">Blogify</h3>
            <p className="max-w-xs text-sm leading-7 text-white/70">
              Blogify is a modern platform for creating, sharing, and discovering
              stories from a growing community of writers and readers.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold text-white">For readers</h4>
            <nav className="space-y-2 text-sm text-white/70">
              <Link href="/blogs" className="block hover:text-white transition-colors">
                Read blogs
              </Link>
              <Link href="/home" className="block hover:text-white transition-colors">
                Trending posts
              </Link>
              <Link href="/register" className="block hover:text-white transition-colors">
                Join community
              </Link>
              <Link href="/login" className="block hover:text-white transition-colors">
                Sign in
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold text-white">About company</h4>
            <nav className="space-y-2 text-sm text-white/70">
              <Link href="/about" className="block hover:text-white transition-colors">
                About Blogify
              </Link>
              <Link href="/profile" className="block hover:text-white transition-colors">
                Authors
              </Link>
              <Link href="/blogs" className="block hover:text-white transition-colors">
                Latest stories
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-base font-semibold text-white">Contact</h4>
            <div className="space-y-2 text-sm text-white/70">
              <p>+977 9803630789</p>
              <p>support@blogify.com</p>
              <p>@blogify (Instagram)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-sm text-white/60">
        © {year} Blogify. All rights reserved.
      </div>
    </footer>
  );
}