"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const NavItem = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`rounded-lg px-3 py-1.5 text-sm transition ${
          active
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link
            href="/online/dashboard"
            className="text-lg font-semibold text-blue-600"
          >
            KnexFlex
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem href="/online/dashboard" label="Dashboard" />
            <NavItem href="/online/sessions" label="Sessions" />
            <NavItem href="/online/import" label="Import" />
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
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
