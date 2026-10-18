import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Ward-Chat",
  description: "Sign in to your Ward-Chat account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400">
          <span className="text-lg font-bold text-white">W</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-50">Welcome back</h1>
        <p className="text-sm text-slate-400">
          Sign in to continue to Ward-Chat
        </p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Links */}
      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
        >
          Create one
        </a>
      </p>
    </div>
  );
}
