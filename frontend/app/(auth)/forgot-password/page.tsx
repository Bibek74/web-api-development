"use client";

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
    <main className="relative h-screen w-screen overflow-hidden grid place-items-center p-4">
      <section className="w-full max-w-md rounded-xl border border-white/15 bg-black/40 backdrop-blur p-6 text-white">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-sm text-white/70 mt-1 mb-6">Enter your account email to receive a reset link.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <p className={`text-xs ${success ? "text-green-300" : "text-red-300"}`}>{message}</p>
          )}

          {success && resetLink && (
            <div className="rounded-md border border-green-400/30 bg-green-500/10 p-3 text-xs text-green-200">
              <p className="mb-2">Reset link generated:</p>
              <a href={resetLink} className="underline break-all">{resetLink}</a>
            </div>
          )}

          {success && resetToken && !resetLink && (
            <div className="rounded-md border border-blue-400/30 bg-blue-500/10 p-3 text-xs text-blue-200">
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
            className="h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <Link href="/login" className="font-semibold hover:underline">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
