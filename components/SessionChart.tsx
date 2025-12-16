"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { Sample } from "@/lib/analytics";
import { downsample } from "@/lib/analytics";

export default function SessionChart({
  samples,
  overlay,
}: {
  samples: Sample[];
  overlay?: Sample[];
}) {
  const data = downsample(samples, 1200).map((s) => ({
    t: s.t,
    sec: (s.t - samples[0].t) / 1000,
    angle: s.angle,
  }));

  const overlayData = overlay && overlay.length
    ? downsample(overlay, 1200).map((s) => ({
        sec: (s.t - overlay[0].t) / 1000,
        overlay: s.angle,
      }))
    : null;

  // merge overlay by index for display
  const merged = overlayData
    ? data.map((d, i) => ({ ...d, overlay: overlayData[i]?.overlay }))
    : data;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sec" tickFormatter={(v) => `${Math.round(v)}s`} />
          <YAxis tickFormatter={(v) => `${Math.round(v)}°`} />
          <Tooltip
            formatter={(val: any, name) => [`${Number(val).toFixed(2)}°`, name]}
            labelFormatter={(v) => `t = ${Number(v).toFixed(1)} s`}
          />
          <Legend />
          <Line type="monotone" dataKey="angle" dot={false} strokeWidth={2} name="Angle" />
          {overlayData && <Line type="monotone" dataKey="overlay" dot={false} strokeWidth={2} name="Overlay" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
