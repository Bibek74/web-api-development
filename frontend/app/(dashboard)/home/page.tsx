import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden text-white">
      
      {/* Background Image */}
      <Image
        src="/background.png"
        alt="Blogify hero background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-16 max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold md:text-6xl">
          Unlimited Blogs,<br /> Stories & Ideas
        </h1>

        <p className="mb-6 max-w-xl text-lg text-white/80">
          Read anywhere. Share anytime. Experience blogging like never before.
        </p>

        <div className="flex gap-4">
          <button className="rounded bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-700">
            Read Now
          </button>

          <button className="rounded border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10">
            More Info
          </button>
        </div>
      </div>

    </main>
  );
}
