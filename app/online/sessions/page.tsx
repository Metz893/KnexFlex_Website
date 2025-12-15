"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import Card from "@/components/Card";

/* ----------------------------- */
/* Types */
/* ----------------------------- */

type CloudSession = {
  id: string;
  userId: string;
  title: string;
  createdAt?: {
    toDate?: () => Date;
  };
  createdAtMs?: number;
  samples?: number[];
  sampleCount?: number;
};

/* ----------------------------- */
/* Component */
/* ----------------------------- */

export default function OnlineSessions() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<CloudSession[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  /* ----------------------------- */
  /* Load sessions */
  /* ----------------------------- */

  const load = async () => {
    if (!user) {
      setSessions([]);
      return;
    }

    const q = query(
      collection(db, "sessions"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    const rows: CloudSession[] = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          title: data.title ?? "Session",
          createdAt: data.createdAt,
          createdAtMs: data.createdAtMs,
          samples: data.samples ?? [],
          sampleCount: data.sampleCount ?? data.samples?.length ?? 0,
        };
      })
      .filter((s) => s.userId === user.uid);

    setSessions(rows);
  };

  useEffect(() => {
    load();
  }, [user]);

  /* ----------------------------- */
  /* Delete */
  /* ----------------------------- */

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await deleteDoc(doc(db, "sessions", id));
      await load();
    } finally {
      setBusyId(null);
    }
  };

  /* ----------------------------- */
  /* Render */
  /* ----------------------------- */

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Cloud Sessions</h1>
        <p className="text-sm text-slate-600">
          These are stored in Firebase under your login.
        </p>
      </div>

      <Card title="Sessions">
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-slate-500">
                    {s.createdAt?.toDate?.().toLocaleString() ?? "—"} •{" "}
                    {s.sampleCount ?? 0} samples
                  </div>
                </div>

                <button
                  onClick={() => remove(s.id)}
                  disabled={busyId === s.id}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                >
                  {busyId === s.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
