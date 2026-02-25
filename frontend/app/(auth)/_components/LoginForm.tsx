"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-actions";
import { useToast } from "@/lib/toast";

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      const res = await handleLogin(values);

      if (res.success) {
        toast.success("Login successful!");
        const role = res.data?.role;

        if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/home"); 
        }
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white/95" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-medium text-white outline-none placeholder-white/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white/95" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-11 w-full rounded-xl border border-white/30 bg-white/10 px-4 pr-11 text-sm font-medium text-white outline-none placeholder-white/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40"
            {...register("password")}
            placeholder="••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 px-3 text-white/80 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.584 10.587A2 2 0 0013.414 13.4M9.88 5.092A10.45 10.45 0 0112 4.9c5.05 0 9.27 3.11 10.5 7.5a10.06 10.06 0 01-4.15 5.35M6.71 6.72C4.73 8 3.22 9.99 2.5 12.4c1.23 4.39 5.45 7.5 10.5 7.5 1.54 0 3-.29 4.33-.81" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.27 2.943 9.542 7-1.272 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password?.message && (
          <p className="text-xs text-red-300">{errors.password.message}</p>
        )}
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-blue-300 hover:text-blue-200 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="mt-1 h-11 w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold tracking-wide shadow-lg shadow-blue-500/35 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-xs text-white/70">
        Secure login • Fast access
      </p>

      <div className="mt-1 text-center text-sm text-white/85">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-300 hover:text-blue-200 hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}