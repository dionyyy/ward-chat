import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - Ward-Chat",
  description: "Create a new Ward-Chat account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400">
          <span className="text-lg font-bold text-white">W</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-50">Create an account</h1>
        <p className="text-sm text-slate-400">
          Join Ward-Chat and start collaborating
        </p>
      </div>

      {/* Form */}
      <RegisterForm />

      {/* Links */}
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
