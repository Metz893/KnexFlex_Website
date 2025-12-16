"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function GaitCycleChart({
  cycles,
  average,
}: {
  cycles: number[][];
  average: number[];
}) {
  // Build chart data: x = normalized time (%)
  const data = average.map((val, i) => ({
    t: i, // 0–99
    avg: val,
    ...Object.fromEntries(
      cycles.map((c, idx) => [`c${idx}`, c[i]])
    ),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Normalized Time", position: "insideBottom", offset: -4 }}
          />
          <YAxis
            domain={[0, 140]}
            tickFormatter={(v) => `${v}°`}
            label={{ value: "Angle", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(v: any) => `${Number(v).toFixed(1)}°`}
            labelFormatter={(l) => `Time: ${l}%`}
          />

          {/* Individual cycles (faint) */}
          {cycles.map((_, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={`c${i}`}
              stroke="#94a3b8"
              dot={false}
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

          {/* Average cycle (bold) */}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#000"
            dot={false}
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
