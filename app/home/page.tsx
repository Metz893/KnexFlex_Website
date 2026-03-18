"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <div className="space-y-20 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-blue-50 to-slate-100 px-6 py-16 shadow-sm md:px-12">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium tracking-wide text-blue-700">
              Biomechanics • Rehab Intelligence • Performance Tracking
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Smarter movement insights with{" "}
              <span className="text-blue-600">KnexFlex</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              KnexFlex helps make gait and rehabilitation data easier to
              understand, easier to monitor, and easier to turn into better
              decisions for clinicians, athletes, and recovery programs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#login"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Get started
              </a>

              {user && (
                <Link
                  href="/online/dashboard"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Go to dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">
                  Motion clarity
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Turn session data into a cleaner view of movement quality and
                  progress.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">
                  Rehab support
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Help track recovery with accessible performance insights over
                  time.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">
                  Session review
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Review trends and identify meaningful changes faster.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">
                  Built to scale
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Designed for both individual use and broader clinical or team
                  workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Mission Statement
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Helping people move better through actionable data
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Our mission is to make biomechanics and rehabilitation data more
            useful, more understandable, and more accessible. KnexFlex is built
            to support better movement analysis, stronger recovery tracking, and
            more confident performance decisions.
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-sky-500 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
            Why KnexFlex
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            A cleaner bridge between raw data and real-world outcomes
          </h2>
          <p className="mt-4 leading-7 text-blue-50">
            We focus on making movement metrics feel less overwhelming and more
            practical, so users can spend less time sorting through numbers and
            more time improving performance and recovery.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          About Us
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          Built for movement science, recovery, and performance insight
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-900">
              Data-first
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              We organize gait and session information into a structure that is
              easier to review and compare.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-900">
              User-centered
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The platform is designed to feel approachable for both technical
              and non-technical users.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-900">
              Growth-ready
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              KnexFlex can grow from a focused workflow into a more complete
              analytics and rehabilitation hub.
            </p>
          </div>
        </div>
      </section>

      {/* Login */}
      <section
        id="login"
        className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-900">
          {user ? (
            <>
              You are signed in to <span className="text-blue-600">KnexFlex</span>
            </>
          ) : (
            <>
              Access <span className="text-blue-600">KnexFlex</span>
            </>
          )}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {user
            ? "You can stay on this homepage, or continue into your dashboard."
            : "Log in or create an account to access the protected online tools."}
        </p>

        {!user ? (
          <>
            <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  mode === "login" ? "bg-white shadow-sm" : "text-slate-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
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
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting
                  ? "Please wait…"
                  : mode === "login"
                  ? "Login"
                  : "Create account"}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <Link
              href="/online/dashboard"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Go to dashboard
            </Link>
          </div>
        )}

        <div className="mt-5 text-xs text-slate-500">
          Protected sections remain behind login.
        </div>
      </section>
    </div>
  );
}