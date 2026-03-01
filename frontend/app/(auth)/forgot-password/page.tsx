"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handleForgotPassword } from "@/lib/actions/auth-actions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [resetToken, setResetToken] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResetLink("");
    setResetToken("");

    const res = await handleForgotPassword({ email });
    setSuccess(res.success);
    setMessage(res.message);

    const resetLinkFromApi = res.data?.resetLink || "";
    const resetTokenFromApi = res.data?.resetToken || "";
    if (res.success && resetTokenFromApi) {
      setResetToken(resetTokenFromApi);
    }

    if (res.success && resetLinkFromApi) {
      setResetLink(resetLinkFromApi);
      if (resetTokenFromApi) {
        router.push(`/reset-password?token=${encodeURIComponent(resetTokenFromApi)}`);
      }
      return;
    }

    setLoading(false);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Image
        src="/img 2.png"
        alt="Forgot password background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/40 via-transparent to-purple-900/30" />

      <div className="relative h-full grid place-items-center p-4 pt-20">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/65 backdrop-blur-xl p-8 text-white shadow-lg shadow-black/40">
          <p className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Account Recovery
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Forgot password</h1>
          <p className="text-sm font-medium text-white/85 mt-1 mb-6">Enter your account email to receive a reset link.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/95" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-black/50 px-4 text-sm font-medium text-white outline-none placeholder-white/60 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <p className={`text-xs ${success ? "text-green-300" : "text-red-300"}`}>{message}</p>
            )}

            {success && resetLink && (
              <div className="rounded-lg border border-green-400/30 bg-green-500/10 p-3 text-xs text-green-200">
                <p className="mb-2">Reset link generated:</p>
                <a href={resetLink} className="underline break-all">{resetLink}</a>
              </div>
            )}

            {success && resetToken && !resetLink && (
              <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-3 text-xs text-blue-200">
                <p className="mb-1">Reset token:</p>
                <p className="break-all">{resetToken}</p>
                <button
                  type="button"
                  onClick={() => router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
                  className="mt-2 underline"
                >
                  Open reset password form
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-amber-300 text-slate-950 text-sm font-semibold hover:bg-amber-200 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-white/85">
            <Link href="/login" className="font-semibold text-amber-200 hover:text-amber-100 hover:underline">Back to login</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
