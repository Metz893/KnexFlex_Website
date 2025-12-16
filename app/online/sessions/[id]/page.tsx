"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/Card";
import SessionChart from "@/components/SessionChart";
import { useAuth } from "@/lib/auth";
import { getCloudSession } from "@/lib/firestore";
import { computeStats, toCSV, percentile, type Sample } from "@/lib/analytics";
import { downloadTextFile } from "@/lib/fileTransfer";

export default function SessionDocPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const s = await getCloudSession(id);
      setSession(s);
    };
    load();
  }, [user, id]);

  const samples: Sample[] = useMemo(() => session?.samples ?? [], [session]);
  const stats = useMemo(() => computeStats(samples), [samples]);

  const p10 = useMemo(() => percentile(samples, 10), [samples]);
  const p50 = useMemo(() => percentile(samples, 50), [samples]);
  const p90 = useMemo(() => percentile(samples, 90), [samples]);

  if (!user) return <p className="text-sm text-slate-600">Sign in.</p>;
  if (!session) return <p className="text-sm text-slate-600">Loading…</p>;

  const created = (session.createdAt?.toDate?.() ?? new Date(session.createdAtMs)).toLocaleString();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{session.title}</h1>
        <p className="text-sm text-slate-600">{created} • {stats?.sampleCount ?? 0} samples</p>
      </div>

      <Card title="Angle Chart">
        <SessionChart samples={samples} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Key Analytics">
          {!stats ? (
            <p className="text-sm text-slate-500">No data.</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <div><b>Duration:</b> {stats.durationSec.toFixed(1)} s</div>
              <div><b>Min / Max:</b> {stats.min.toFixed(2)}° / {stats.max.toFixed(2)}°</div>
              <div><b>ROM:</b> {stats.rom.toFixed(2)}°</div>
              <div><b>Mean ± SD:</b> {stats.mean.toFixed(2)}° ± {stats.stdev.toFixed(2)}°</div>
              <div><b>Velocity avg / max:</b> {stats.velMean.toFixed(1)} / {stats.velMax.toFixed(1)} deg/s</div>
              <div><b>Rep estimate:</b> {stats.reps}</div>
            </div>
          )}
        </Card>

        <Card title="Distribution">
          <div className="space-y-2 text-sm text-slate-700">
            <div><b>P10:</b> {p10?.toFixed(2) ?? "—"}°</div>
            <div><b>P50 (median):</b> {p50?.toFixed(2) ?? "—"}°</div>
            <div><b>P90:</b> {p90?.toFixed(2) ?? "—"}°</div>
            <p className="text-xs text-slate-500">
              Use these to compare sessions or define “target ranges” clinically.
            </p>
          </div>
        </Card>
      </div>

      <Card title="Export + Copy">
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
            onClick={async () => {
              await navigator.clipboard.writeText(toCSV(samples));
              alert("Copied CSV ✅");
            }}
          >
            Copy CSV
          </button>

          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
            onClick={() => downloadTextFile(`knexflex_${id}.csv`, toCSV(samples), "text/csv")}
          >
            Download CSV
          </button>

          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
            onClick={() => downloadTextFile(`knexflex_${id}.json`, JSON.stringify(session, null, 2))}
          >
            Download JSON
          </button>
        </div>
      </Card>
    </div>
  );
}
