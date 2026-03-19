"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProtectedArea = pathname.startsWith("/online");

  const Item = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${
        pathname.startsWith(href)
          ? "bg-blue-100 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-blue-600">
            KnexFlex
          </Link>

          {isProtectedArea && user && (
            <nav className="hidden items-center gap-2 md:flex">
              <Item href="/online/dashboard" label="Dashboard" />
              <Item href="/online/sessions" label="Sessions" />
              <Item href="/online/gait-similarity" label="Gait Similarity" />
              <Item href="/online/import" label="Import" />
              <Item href="/online/community" label="Community" />
              <Item href="/online/admin/sessions" label="Admin" />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              {!isProtectedArea && (
                <Link
                  href="/online/dashboard"
                  className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
              )}

              <button
                onClick={async () => {
                  await signOut(auth);
                  router.replace("/");
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}