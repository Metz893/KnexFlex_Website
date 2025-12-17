// app/online/sessions/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import { useAuth } from "@/lib/auth";
import { listCloudSessions, deleteCloudSession, type CloudSession } from "@/lib/firestore";

export default function OnlineSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CloudSession[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "samples">("new");

  const load = async () => {
    if (!user) {
      setSessions([]);
      return;
    }
    const rows = await listCloudSessions(user.uid);
    setSessions(rows);
  };

  useEffect(() => {
    load();
  }, [user]);

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await deleteCloudSession(id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) (s.tags ?? []).forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = sessions.filter((s) => {
      const name = (s.displayName ?? s.title ?? "").toLowerCase();
      const notes = (s.notes ?? "").toLowerCase();
      const tags = (s.tags ?? []).join(" ").toLowerCase();
      const okTerm = !term || name.includes(term) || notes.includes(term) || tags.includes(term);
      const okTag = !tag || (s.tags ?? []).includes(tag);
      return okTerm && okTag;
    });

    out = out.sort((a, b) => {
      if (sort === "samples") return (b.sampleCount ?? 0) - (a.sampleCount ?? 0);
      if (sort === "old") return (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0);
      return (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0);
    });

    return out;
  }, [sessions, q, tag, sort]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Session Documents"
        subtitle="Searchable, taggable session library with analytics-ready documents."
        right={
          <Link
            href="/online/import"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Import Offline Sessions
          </Link>
        }
      />

      <Card title="Search & Filters">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
            placeholder="Search title, notes, tags…"
          />

          <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm">
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border bg-white px-3 py-2 text-sm">
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
            <option value="samples">Most samples</option>
          </select>
        </div>
      </Card>

      <Card title="Your Sessions">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            No sessions match. Try a different search or import a session.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => {
              const created = s.createdAt?.toDate?.() ?? new Date(s.createdAtMs);

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <Link href={`/online/sessions/${s.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                      {s.displayName ?? s.title}
                    </Link>

                    <div className="text-xs text-slate-500">
                      {created.toLocaleString()} • {s.sampleCount} samples
                    </div>

                    {s.tags?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.tags.slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/online/sessions/${s.id}`} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">
                      Open
                    </Link>

                    <button
                      onClick={() => remove(s.id)}
                      disabled={busyId === s.id}
                      className="rounded-lg border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {busyId === s.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
