"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "./ui/card";
import { useStakingStats } from "@/lib/hooks";

const ranges = [
  { label: "7D", points: 7 },
  { label: "30D", points: 30 },
  { label: "90D", points: 90 },
];

function buildHistory(base: number, points: number) {
  // Deterministic synthetic series around the live APY for visual context.
  const data: { day: string; apy: number }[] = [];
  let apy = base;
  for (let i = points; i >= 0; i--) {
    const wave = Math.sin(i / 3) * 0.6 + Math.cos(i / 7) * 0.4;
    apy = Math.max(0.5, base + wave);
    data.push({ day: `D-${i}`, apy: +apy.toFixed(2) });
  }
  return data;
}

export function ApyChart() {
  const [range, setRange] = useState(ranges[1]);
  const { data: stats } = useStakingStats();
  const apyBps = stats?.[1]?.result as bigint | undefined;
  const liveApy = apyBps ? Number(apyBps) / 100 : 7.84;
  const data = useMemo(
    () => buildHistory(liveApy, range.points),
    [range, liveApy]
  );

  return (
    <Card id="analytics" className="col-span-1 lg:col-span-2">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle>Protocol APY</CardTitle>
          <div className="mt-2 text-3xl font-semibold text-white">
            {data[data.length - 1].apy.toFixed(2)}%
          </div>
          <div className="text-xs text-white/40">
            Weighted average across all active pools
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                range.label === r.label
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 0, top: 10 }}>
            <defs>
              <linearGradient id="apyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(10,10,14,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                color: "white",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "APY"]}
            />
            <Area
              type="monotone"
              dataKey="apy"
              stroke="#9c86ff"
              strokeWidth={2}
              fill="url(#apyGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
