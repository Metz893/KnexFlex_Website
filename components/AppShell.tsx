// components/AppShell.tsx
"use client";

import Navbar from "@/components/NavBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}