"use client";

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
    <main className="relative h-screen w-screen overflow-hidden grid place-items-center p-4">
      <section className="w-full max-w-md rounded-xl border border-white/15 bg-black/40 backdrop-blur p-6 text-white">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-white/70 mt-1 mb-6">Set your new password.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="token">Reset token</label>
            <input
              id="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
              placeholder="Paste reset token"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="new_password">New password</label>
            <input
              id="new_password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
              placeholder="••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="confirm_password">Confirm password</label>
            <input
              id="confirm_password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
              placeholder="••••••"
            />
          </div>

          {message && (
            <p className={`text-xs ${success ? "text-green-300" : "text-red-300"}`}>{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <Link href="/login" className="font-semibold hover:underline">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
