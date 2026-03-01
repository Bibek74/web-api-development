"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handleResetPassword } from "@/lib/actions/auth-actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setToken(search.get("token") || "");
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setSuccess(false);
      setMessage("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await handleResetPassword({
      token,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    });

    setSuccess(res.success);
    setMessage(res.message);
    setLoading(false);

    if (res.success) {
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Image
        src="/img 4.png"
        alt="Reset password background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/35 via-transparent to-purple-900/35" />

      <div className="relative h-full grid place-items-center p-4 pt-20">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/65 backdrop-blur-xl p-8 text-white shadow-lg shadow-black/40">
          <p className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Security
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Reset password</h1>
          <p className="text-sm font-medium text-white/85 mt-1 mb-6">Set your new password.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/95" htmlFor="token">Reset token</label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-black/50 px-4 text-sm font-medium text-white outline-none placeholder-white/60 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
                placeholder="Paste reset token"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/95" htmlFor="new_password">New password</label>
              <input
                id="new_password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-black/50 px-4 text-sm font-medium text-white outline-none placeholder-white/60 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
                placeholder="••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/95" htmlFor="confirm_password">Confirm password</label>
              <input
                id="confirm_password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-black/50 px-4 text-sm font-medium text-white outline-none placeholder-white/60 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
                placeholder="••••••"
              />
            </div>

            {message && (
              <p className={`text-xs ${success ? "text-green-300" : "text-red-300"}`}>{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-amber-300 text-slate-950 text-sm font-semibold hover:bg-amber-200 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
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
