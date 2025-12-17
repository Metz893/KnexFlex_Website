"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import { useAuth } from "@/lib/auth";
import { analyzeGaitAngles } from "@/lib/gaitAnalysis";
import GaitCycleChart from "@/components/GaitCycleChart";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ================================
   Types
================================ */

type CommunityRow = {
  id: string;
  createdAtMs: number;
  injury: string;
  weeksSinceInjury: number;
  leg: "left" | "right";
  averageCycle: number[];
};

/* ================================
   Component
================================ */

export default function CommunityPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState<CommunityRow[]>([]);
  const [status, setStatus] = useState<string>("");

  /* ================================
     Load community data
  ================================ */

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "community_gait"),
        orderBy("createdAtMs", "desc"),
        limit(30)
      );

      const snap = await getDocs(q);

      const parsed: CommunityRow[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          createdAtMs: data.createdAtMs ?? Date.now(),
          injury: String(data.injury ?? "unknown"),
          weeksSinceInjury: Number(data.weeksSinceInjury ?? 0),
          leg: data.leg === "right" ? "right" : "left",
          averageCycle: Array.isArray(data.averageCycle)
            ? data.averageCycle.map(Number)
            : [],
        };
      });

      setRows(parsed);
    };

    load();
  }, []);

  /* ================================
     Compute cohort average
  ================================ */

  const cohortAverage = useMemo(() => {
    if (!rows.length) return null;

    const len = rows[0].averageCycle.length;
    if (!len) return null;

    const sum = new Array(len).fill(0);

    for (const r of rows) {
      for (let i = 0; i < len; i++) {
        sum[i] += r.averageCycle[i] ?? 0;
      }
    }

    return sum.map((v) => v / rows.length);
  }, [rows]);

  /* ================================
     Share handler
  ================================ */

  const shareLatest = async () => {
    if (!user) {
      setStatus("Sign in to share data.");
      return;
    }

    if (!cohortAverage) {
      setStatus("No valid gait data to share.");
      return;
    }

    setStatus("Sharing…");

    await addDoc(collection(db, "community_gait"), {
      createdAtMs: Date.now(),
      injury: "ACL",
      weeksSinceInjury: 6,
      leg: "left",
      averageCycle: cohortAverage,
    });

    setStatus("Shared anonymously ✅");
  };

  /* ================================
     Render
  ================================ */

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Community Gait Comparison"
        subtitle="Anonymous, aggregated gait cycles across recovery timelines"
      />

      <Card title="Community Average">
        {!cohortAverage ? (
          <p className="text-sm text-slate-500">
            Not enough data yet.
          </p>
        ) : (
          <GaitCycleChart cycles={[]} average={cohortAverage} />
        )}
      </Card>

      <Card title="Your Contribution">
        <p className="text-sm text-slate-600">
          Share your anonymized gait cycle to help others understand
          recovery progress.
        </p>

        <button
          onClick={shareLatest}
          className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Share My Data
        </button>

        {status && (
          <p className="mt-2 text-xs text-slate-600">{status}</p>
        )}
      </Card>

      <Card title="How this helps">
        <ul className="list-disc pl-5 text-sm text-slate-700">
          <li>Compare recovery trajectories</li>
          <li>Establish realistic rehab benchmarks</li>
          <li>Improve clinical decision-making</li>
          <li>Advance open biomechanics research</li>
        </ul>
      </Card>
    </div>
  );
}
