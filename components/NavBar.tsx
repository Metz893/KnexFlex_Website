"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/online/dashboard" className="font-semibold text-blue-600">
            KnexFlex
          </Link>
          <nav className="flex gap-3 text-sm text-slate-600">
            <Link href="/online/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/online/sessions" className="hover:text-slate-900">
              Sessions
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {user?.email ?? "Not signed in"}
          </span>
          {user && (
            <button
              onClick={() => signOut(auth)}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
