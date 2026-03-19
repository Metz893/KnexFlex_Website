"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const newMode =
      searchParams.get("mode") === "signup" ? "signup" : "login";
    setMode(newMode);
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/online/dashboard");
    }
  }, [loading, user, router]);

  const submit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      router.replace("/online/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Welcome to KnexFlex
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {mode === "login" ? "Log in to your account" : "Create your account"}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {mode === "login"
            ? "Access your protected dashboard and tools."
            : "Sign up to access the protected KnexFlex platform."}
        </p>

        <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
              mode === "login" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
              mode === "signup" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
              ? "Log in"
              : "Create account"}
          </button>
        </div>
      </section>
    </div>
  );
}