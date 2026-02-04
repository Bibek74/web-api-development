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

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative h-full grid place-items-center p-4 pt-20">
        <section className="w-full max-w-md rounded-xl border border-white/15 bg-black/40 backdrop-blur p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-white/70 mt-1 mb-6">
            Sign in to continue
          </p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
