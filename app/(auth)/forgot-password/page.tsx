import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - Ward-Chat",
  description: "Reset your Ward-Chat password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400">
          <span className="text-lg font-bold text-white">W</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-50">Reset password</h1>
        <p className="text-sm text-slate-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Form */}
      <ForgotPasswordForm />

      {/* Links */}
      <p className="text-center text-sm text-slate-400">
        Remember your password?{" "}
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
