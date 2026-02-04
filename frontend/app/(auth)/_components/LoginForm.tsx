"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-actions";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      const res = await handleLogin(values);

      if (res.success) {
        const role = res.data?.role;

        if (role === "admin") {
          router.replace("/admin/users");
        } else {
          router.replace("/home"); 
        }
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && (
          <p className="text-[11px] text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
          {...register("password")}
          placeholder="••••••"
        />
        {errors.password?.message && (
          <p className="text-[11px] text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="mt-2 h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Logging in..." : "Log in"}
      </button>

      <div className="mt-2 text-center text-xs">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}