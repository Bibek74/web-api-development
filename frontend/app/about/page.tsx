import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] w-full text-white">

      {/* Background Image */}
      <Image
        src="/img1.jpg"
        alt="Blogify background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">

        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl text-white">About Blogify</h1>
          <p className="max-w-2xl mx-auto text-white/70 text-lg">
            Blogify is your home for stories, ideas, and inspiration.
            Write anytime. Publish anywhere. Inspire everyone.
          </p>
        </section>

        {/* Features Section */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">Unlimited Blogs</h2>
            <p className="text-white/70">
              Access a wide range of blogs, from evergreen content to the latest trends.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">Any Device</h2>
            <p className="text-white/70">
              Blog anywhere. Stay connected everywhere.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">Delete Anytime</h2>
            <p className="text-white/70">
              No pressure. Create on your terms, whenever you want.
            </p>
          </div>
        </section>

      </div>

      {/* Mission Section  */}
      <section className="mt-16 bg-zinc-900/50 py-16 px-4 text-center backdrop-blur-sm w-full">
        <h2 className="mb-4 text-3xl font-bold text-white">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-white/70 text-lg">
          At Blogify, we believe great stories should be easy to write and share.
          Our goal is to bring the magic of storytelling directly to your screen, wherever you are.
        </p>
      </section>

    </main>
  );
}
