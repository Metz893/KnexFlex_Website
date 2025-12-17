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
  const [compareId, setCompareId] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const rows = await listCloudSessions(user.uid);
      setSessions(rows);
      if (!activeId && rows[0]) setActiveId(rows[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId]
  );

  const compare = useMemo(
    () => sessions.find((s) => s.id === compareId),
    [sessions, compareId]
  );

  const samples: Sample[] = useMemo(
    () => (active?.samples ?? []).map((x: any) => ({ t: x.t, angle: x.angle })),
    [active]
  );

  const compareSamples: Sample[] = useMemo(
    () => (compare?.samples ?? []).map((x: any) => ({ t: x.t, angle: x.angle })),
    [compare]
  );

  const angles = useMemo(() => samples.map((s) => s.angle), [samples]);
  const compareAngles = useMemo(
    () => compareSamples.map((s) => s.angle),
    [compareSamples]
  );

  const gait = useMemo(() => analyzeGaitAngles(angles), [angles]);
  const compareGait = useMemo(
    () => analyzeGaitAngles(compareAngles),
    [compareAngles]
  );

  const comparisonStats = useMemo(() => {
    if (!gait || !compareGait) return null;

    const avgA = gait.averageCycle;
    const avgB = compareGait.averageCycle;

    const mad =
      avgA.reduce((sum, v, i) => sum + Math.abs(v - avgB[i]), 0) / avgA.length;

    return {
      peakFlexDiff: gait.peakFlexion - compareGait.peakFlexion,
      heelStrikeDiff: gait.heelStrikeIndex - compareGait.heelStrikeIndex,
      toeOffDiff: gait.toeOffIndex - compareGait.toeOffIndex,
      meanAbsDeviation: mad,
    };
  }, [gait, compareGait]);

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

      {/* ORIGINAL — UNCHANGED */}
      <Card title="Normalized Cycles">
        {!gait ? (
          <p className="text-sm text-slate-600">
            Not enough valid cycles detected. Try a longer walking session or cleaner signal.
          </p>
        ) : (
          <div className="space-y-4">
            <GaitCycleChart cycles={gait.cycles} average={gait.averageCycle} />
            <div className="grid gap-3 md:grid-cols-4">
              <Stat label="Cycles kept" value={gait.cycles.length} />
              <Stat label="Heel strike" value={`${gait.heelStrikeIndex}%`} />
              <Stat label="Toe off" value={`${gait.toeOffIndex}%`} />
              <Stat label="Peak flex" value={`${gait.peakFlexion.toFixed(1)}°`} />
            </div>
          </div>
        )}
      </Card>

      {/* ADVANCED COMPARISON */}
      <Card
        title="Average Cycle Comparison"
        right={
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            <option value="">Select session to compare</option>
            {sessions
              .filter((s) => s.id !== activeId)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName ?? s.title}
                </option>
              ))}
          </select>
        }
      >
        {!gait || !compareGait ? (
          <p className="text-sm text-slate-600">
            Select a valid second session to compare average gait cycles.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Separate comparison graph */}
            <GaitCycleChart
              cycles={[compareGait.averageCycle]}
              average={gait.averageCycle}
            />

            {/* Quantitative comparison */}
            {comparisonStats && (
              <div className="grid gap-3 md:grid-cols-4">
                <Stat
                  label="Peak flex Δ"
                  value={`${comparisonStats.peakFlexDiff.toFixed(1)}°`}
                />
                <Stat
                  label="Heel strike Δ"
                  value={`${comparisonStats.heelStrikeDiff}%`}
                />
                <Stat
                  label="Toe off Δ"
                  value={`${comparisonStats.toeOffDiff}%`}
                />
                <Stat
                  label="Mean abs deviation"
                  value={`${comparisonStats.meanAbsDeviation.toFixed(2)}°`}
                />
              </div>
            )}

            {/* Interpretation */}
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                This comparison overlays the <b>average gait cycle</b> from two
                sessions. Differences in timing (heel strike / toe off) indicate
                cadence or stance-phase changes, while amplitude differences
                reflect altered joint loading, fatigue, or compensation.
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card title="Interpretation Guide">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Bold line = current session average</li>
          <li>Lighter line = comparison session average</li>
          <li>Peak differences suggest loading or fatigue effects</li>
          <li>Timing shifts may indicate cadence or asymmetry changes</li>
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
