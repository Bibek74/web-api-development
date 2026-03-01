import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] w-full text-white bg-linear-to-b from-black via-zinc-950 to-slate-950 overflow-hidden">

      {/* Background Image */}
      <Image
        src="/img1.jpg"
        alt="Blogify background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-amber-200/8 blur-3xl" />
        <div className="absolute bottom-10 -right-20 h-72 w-72 rounded-full bg-yellow-200/6 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">

        {/* Hero Section */}
        <section className="text-center py-16">
          <p className="mb-4 inline-flex items-center rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1 text-xs font-medium tracking-[0.18em] uppercase text-amber-100">
            About Our Vision
          </p>
          <h1 className="mb-4 text-4xl font-bold md:text-6xl text-white">About Blogify</h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-lg">
            Blogify is your home for stories, ideas, and inspiration.
            Write anytime. Publish anywhere. Inspire everyone.
          </p>
        </section>

        {/* Features Section */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/80 hover:border-amber-200/20 transition shadow-xl shadow-black/40">
            <h2 className="mb-2 text-xl font-semibold text-white">Unlimited Blogs</h2>
            <p className="text-slate-300">
              Access a wide range of blogs, from evergreen content to the latest trends.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/80 hover:border-amber-200/20 transition shadow-xl shadow-black/40">
            <h2 className="mb-2 text-xl font-semibold text-white">Any Device</h2>
            <p className="text-slate-300">
              Blog anywhere. Stay connected everywhere.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/80 hover:border-amber-200/20 transition shadow-xl shadow-black/40">
            <h2 className="mb-2 text-xl font-semibold text-white">Delete Anytime</h2>
            <p className="text-slate-300">
              No pressure. Create on your terms, whenever you want.
            </p>
          </div>
        </section>

      </div>

      {/* Mission Section  */}
      <section className="mt-16 bg-zinc-900/65 border-t border-white/10 py-16 px-4 text-center backdrop-blur-sm w-full">
        <h2 className="mb-4 text-3xl font-bold text-white">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-slate-300 text-lg">
          At Blogify, we believe great stories should be easy to write and share.
          Our goal is to bring the magic of storytelling directly to your screen, wherever you are.
        </p>
      </section>

    </main>
  );
}
