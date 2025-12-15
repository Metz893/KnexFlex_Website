"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function OnlineLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Allow login page without auth
  const isLogin = pathname.startsWith("/login");

  // While auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user && !isLogin) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
