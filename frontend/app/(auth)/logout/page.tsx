"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearSessionCookies } from "@/lib/user-session";

export default function LogoutPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleLogout = async () => {
		setLoading(true);
		clearSessionCookies();
		router.replace("/login");
	};

	return (
		<main className="relative h-screen w-screen overflow-hidden">
			<Image
				src="/img 2.png"
				alt="Logout background"
				fill
				priority
				className="object-cover"
			/>

			<div className="absolute inset-0 bg-black/65" />
			<div className="absolute inset-0 bg-linear-to-br from-blue-900/40 via-transparent to-purple-900/30" />

			<div className="relative h-full grid place-items-center p-4 pt-20">
				<section className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/65 backdrop-blur-xl p-8 text-white shadow-lg shadow-black/40">
					<p className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
						Blogify Session
					</p>
					<h1 className="text-3xl font-extrabold tracking-tight">Log out</h1>
					<p className="text-sm font-medium text-white/85 mt-1 mb-6">
						Do you want to end your current session?
					</p>

					<div className="space-y-3">
						<button
							type="button"
							onClick={handleLogout}
							disabled={loading}
							className="h-11 w-full rounded-lg bg-amber-300 text-slate-950 text-sm font-semibold tracking-wide hover:bg-amber-200 disabled:opacity-60"
						>
							{loading ? "Logging out..." : "Log out"}
						</button>

						<Link
							href="/home"
							className="h-11 w-full rounded-lg border border-white/20 text-slate-200 hover:bg-white/10 transition-colors inline-flex items-center justify-center text-sm font-semibold tracking-wide"
						>
							Cancel
						</Link>
					</div>
				</section>
			</div>
		</main>
	);
}
