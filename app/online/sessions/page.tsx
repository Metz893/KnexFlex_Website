"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth";
import {
  listCloudSessions,
  deleteCloudSession,
  type CloudSession,
} from "@/lib/firestore";

export default function OnlineSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CloudSession[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Session Documents</h1>
          <p className="text-sm text-slate-600">
            Each session is stored as a document with full analytics,
            export tools, and metadata.
          </p>
        </div>

        <Link
          href="/online/import"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Import Offline Sessions
        </Link>
      </div>

      {/* Sessions List */}
      <Card title="Your Sessions">
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No sessions yet. Record offline or import a session to begin.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const created =
                s.createdAt?.toDate?.() ??
                new Date(s.createdAtMs);

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                >
                  {/* Left */}
                  <div className="space-y-0.5">
                    <Link
                      href={`/online/sessions/${s.id}`}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {s.title}
                    </Link>

                    <div className="text-xs text-slate-500">
                      {created.toLocaleString()} •{" "}
                      {s.sampleCount} samples
                    </div>

                    {s.tags?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.tags.slice(0, 4).map((tag) => (
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

                  {/* Right */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/online/sessions/${s.id}`}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
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

      {/* Info */}
      <Card title="How sessions are organized">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Each recording is stored as a structured document</li>
          <li>Documents include raw data, analytics, notes, and tags</li>
          <li>Sessions can be exported, compared, or analyzed</li>
          <li>Offline recordings are imported securely into your account</li>
        </ul>
      </Card>
    </div>
  );
}
