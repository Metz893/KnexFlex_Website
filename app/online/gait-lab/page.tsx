// app/online/gait-lab/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import { useAuth } from "@/lib/auth";
import { listCloudSessions } from "@/lib/firestore";
import type { Sample } from "@/lib/analytics";
import { analyzeGaitAngles } from "@/lib/gaitAnalysis";
import GaitCycleChart from "@/components/GaitCycleChart";

export default function GaitLabPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const rows = await listCloudSessions(user.uid);
      setSessions(rows);
      if (!activeId && rows[0]) setActiveId(rows[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const active = useMemo(() => sessions.find((s) => s.id === activeId), [sessions, activeId]);
  const samples: Sample[] = useMemo(() => (active?.samples ?? []).map((x: any) => ({ t: x.t, angle: x.angle })), [active]);
  const angles = useMemo(() => samples.map((s) => s.angle), [samples]);

  const gait = useMemo(() => analyzeGaitAngles(angles), [angles]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Gait Lab"
        subtitle="Normalize cycles, overlay repeats, and extract gait events (heel strike / toe off)."
        right={
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName ?? s.title}
              </option>
            ))}
          </select>
        }
      />

      <Card title="Normalized Cycles">
        {!gait ? (
          <p className="text-sm text-slate-600">
            Not enough valid cycles detected. Try a longer walking session or cleaner signal.
          </p>
        ) : (
          <div className="space-y-4">
            <GaitCycleChart cycles={gait.cycles} average={gait.averageCycle} />
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="text-xs text-slate-500">Cycles kept</div>
                <div className="mt-1 font-semibold">{gait.cycles.length}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="text-xs text-slate-500">Heel strike</div>
                <div className="mt-1 font-semibold">{gait.heelStrikeIndex}%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="text-xs text-slate-500">Toe off</div>
                <div className="mt-1 font-semibold">{gait.toeOffIndex}%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="text-xs text-slate-500">Peak flex</div>
                <div className="mt-1 font-semibold">{gait.peakFlexion.toFixed(1)}°</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title="Interpretation Guide">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Faint lines = individual normalized cycles</li>
          <li>Bold line = your averaged cycle</li>
          <li>Heel strike index is the minimum in the average cycle</li>
          <li>Toe off is the second minimum sufficiently far from heel strike</li>
        </ul>
      </Card>
    </div>
  );
}
