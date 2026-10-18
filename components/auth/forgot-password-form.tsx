"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);
    setError(null);

    try {
      // Use the $fetch method to call the forget-password endpoint directly
      await authClient.$fetch("/forget-password", {
        method: "POST",
        body: {
          email: data.email,
          redirectTo: "/reset-password",
        },
      });
      setIsSuccess(true);
    } catch {
      // Always show success to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/30 p-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-slate-50">
            Check your email
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            If an account exists with that email, we&apos;ve sent you a password
            reset link.
          </p>
        </div>
        <a
          href="/login"
          className="flex items-center gap-1 text-sm text-sky-400 transition-colors hover:text-sky-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-10 items-center justify-center rounded-lg bg-sky-500 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Send Reset Link"
        )}
      </button>
    </form>
  );
}
