"use client";

import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Image
        src="/img 2.png"
        alt="Login background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/40 via-transparent to-purple-900/30" />

      <div className="relative h-full grid place-items-center p-4 pt-20">
        <section className="w-full max-w-md rounded-2xl border border-white/30 bg-black/45 backdrop-blur-xl p-8 text-white shadow-2xl shadow-black/40">
          <p className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Blogify Access
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-sm font-medium text-white/85 mt-1 mb-6">
            Sign in to continue
          </p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
