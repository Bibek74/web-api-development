import Image from "next/image";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Image
        src="/img 4.png"
        alt="Register background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative h-full grid place-items-center p-4 pt-20">
        <section className="w-full max-w-md rounded-xl border-2 border-white/35 bg-black/40 backdrop-blur p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm font-medium text-white/80 mt-1 mb-6">
            Get started in under a minute
          </p>

          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
