"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/utils/api";
import { AdminAICostSummary } from "@/lib/types";

/* ── helpers ──────────────────────────────────────────────────── */

function KPI({ label, value, sub, color = "blue" }: { label: string; value: string | number; sub?: string; color?: "blue" | "green" | "yellow" | "red" | "purple" }) {
  const ring: Record<string, string> = { blue: "border-l-blue-500", green: "border-l-green-500", yellow: "border-l-yellow-500", red: "border-l-red-500", purple: "border-l-purple-500" };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${ring[color]} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color = "blue" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const bg: Record<string, string> = { blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500", yellow: "bg-yellow-400", purple: "bg-purple-500" };
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`${bg[color] || "bg-blue-500"} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ── Aggregation helpers ──────────────────────────────────────── */
type DailyRow = { date: string; tokens_used: number; credits_consumed: number; operation_count: number };
type AggregatedPoint = { label: string; tokens: number; credits: number; ops: number };

function aggregateByWeek(daily: DailyRow[]): AggregatedPoint[] {
  const weeks: Record<string, AggregatedPoint> = {};
  for (const row of daily) {
    const d = new Date(row.date);
    // ISO week start (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    const key = weekStart.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { label: `W ${key}`, tokens: 0, credits: 0, ops: 0 };
    weeks[key].tokens += row.tokens_used;
    weeks[key].credits += row.credits_consumed;
    weeks[key].ops += row.operation_count;
  }
  return Object.values(weeks);
}

function aggregateByMonth(daily: DailyRow[]): AggregatedPoint[] {
  const months: Record<string, AggregatedPoint> = {};
  for (const row of daily) {
    const key = row.date.slice(0, 7); // YYYY-MM
    if (!months[key]) months[key] = { label: key, tokens: 0, credits: 0, ops: 0 };
    months[key].tokens += row.tokens_used;
    months[key].credits += row.credits_consumed;
    months[key].ops += row.operation_count;
  }
  return Object.values(months);
}

function dailyToPoints(daily: DailyRow[]): AggregatedPoint[] {
  return daily.map((d) => ({ label: d.date, tokens: d.tokens_used, credits: d.credits_consumed, ops: d.operation_count }));
}

/* ── SVG Line/Area Chart ──────────────────────────────────────── */

function TokenChart({ points, metric }: { points: AggregatedPoint[]; metric: "tokens" | "credits" | "ops" }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (points.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data to display for the selected period.</p>;
  }

  const W = 800;
  const H = 280;
  const PL = 60; // padding left
  const PR = 20;
  const PT = 20;
  const PB = 60;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const values = points.map((p) => p[metric]);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const xStep = points.length > 1 ? chartW / (points.length - 1) : chartW / 2;

  const coords = points.map((p, i) => ({
    x: PL + (points.length > 1 ? i * xStep : chartW / 2),
    y: PT + chartH - ((p[metric] - minVal) / (maxVal - minVal)) * chartH,
  }));

  // Build path
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${PT + chartH} L ${coords[0].x} ${PT + chartH} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i));

  // Color map
  const colors: Record<string, { stroke: string; fill: string; dot: string }> = {
    tokens: { stroke: "#3b82f6", fill: "rgba(59,130,246,0.10)", dot: "#2563eb" },
    credits: { stroke: "#8b5cf6", fill: "rgba(139,92,246,0.10)", dot: "#7c3aed" },
    ops: { stroke: "#10b981", fill: "rgba(16,185,129,0.10)", dot: "#059669" },
  };
  const c = colors[metric];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTickVals.map((v, i) => {
          const y = PT + chartH - (v / maxVal) * chartH;
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              <text x={PL - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>
                {fmtNum(v)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill={c.fill} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={c.stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {coords.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={hoverIdx === i ? 5 : 3}
            fill={hoverIdx === i ? c.dot : c.stroke}
            stroke="white"
            strokeWidth={2}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}

        {/* X labels (show subset to avoid crowding) */}
        {coords.map((pt, i) => {
          const step = Math.max(1, Math.floor(points.length / 12));
          if (i % step !== 0 && i !== points.length - 1) return null;
          const label = points[i].label.length > 10 ? points[i].label.slice(5) : points[i].label;
          return (
            <text key={`xl-${i}`} x={pt.x} y={H - PB + 18} textAnchor="middle" className="fill-gray-500" fontSize={10} transform={`rotate(-30, ${pt.x}, ${H - PB + 18})`}>
              {label}
            </text>
          );
        })}

        {/* Hover tooltip */}
        {hoverIdx !== null && (
          <g>
            <line x1={coords[hoverIdx].x} y1={PT} x2={coords[hoverIdx].x} y2={PT + chartH} stroke={c.stroke} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
            <rect x={coords[hoverIdx].x - 55} y={coords[hoverIdx].y - 36} width={110} height={28} rx={6} fill="white" stroke={c.stroke} strokeWidth={1} />
            <text x={coords[hoverIdx].x} y={coords[hoverIdx].y - 18} textAnchor="middle" className="fill-gray-800 font-medium" fontSize={11}>
              {fmtNum(values[hoverIdx])} {metric}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────── */

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AICostsPage() {
  const [data, setData] = useState<AdminAICostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [chartMetric, setChartMetric] = useState<"tokens" | "credits" | "ops">("tokens");

  // Date range state — default to last 30 days
  const [endDate, setEndDate] = useState(() => toISODate(new Date()));
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toISODate(d);
  });

  // Quick-preset buttons
  const applyPreset = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(toISODate(start));
    setEndDate(toISODate(end));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
      const days = Math.max(1, Math.ceil(diffMs / 86_400_000));
      const d = await apiClient.getAICosts(days, startDate, endDate);
      setData(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load AI cost data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const chartPoints = useMemo(() => {
    if (!data?.daily_usage) return [];
    const daily = data.daily_usage;
    switch (granularity) {
      case "week": return aggregateByWeek(daily);
      case "month": return aggregateByMonth(daily);
      default: return dailyToPoints(daily);
    }
  }, [data, granularity]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading AI cost data…</div>;
  if (err) return <div className="p-8 text-center text-red-500">{err}</div>;
  if (!data) return null;

  const dailyUsage = data.daily_usage ?? [];
  const byOperation = data.by_operation ?? [];
  const byUser = data.by_user ?? [];
  const maxDailyTokens = Math.max(...dailyUsage.map((d) => d.tokens_used), 1);
  const maxOpTokens = Math.max(...byOperation.map((o) => o.total_tokens), 1);
  const maxUserTokens = Math.max(...byUser.map((u) => u.total_tokens), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🤖 AI Costs</h1>
            <p className="text-sm text-gray-500 mt-1">Token usage, credit consumption, and estimated OpenAI spend</p>
          </div>
          <button onClick={load} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
            Refresh
          </button>
        </div>

        {/* Date range row */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
          {/* Quick presets */}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Quick:</span>
          {([
            { label: "7D", days: 7 },
            { label: "14D", days: 14 },
            { label: "30D", days: 30 },
            { label: "90D", days: 90 },
            { label: "1Y", days: 365 },
          ] as const).map((p) => (
            <button
              key={p.days}
              onClick={() => applyPreset(p.days)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              {p.label}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Calendar inputs */}
          <label className="text-xs text-gray-500">From</label>
          <input
            type="date"
            title="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
            className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <label className="text-xs text-gray-500">To</label>
          <input
            type="date"
            title="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={toISODate(new Date())}
            className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <span className="text-xs text-gray-400 ml-1">
            {Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000))} days
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Tokens" value={fmtNum(data.total_tokens_used)} color="blue" />
        <KPI label="Credits Consumed" value={fmtNum(data.total_credits_consumed)} color="purple" />
        <KPI label="Estimated Cost" value={`$${data.estimated_cost_usd.toFixed(2)}`} color="red" />
        <KPI label="Operations" value={fmtNum(byOperation.reduce((s, o) => s + o.count, 0))} sub={`${byOperation.length} distinct types`} color="green" />
      </div>

      {/* ── Token Usage Graph ────────────────────────────────────── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {chartMetric === "tokens" ? "Token Usage" : chartMetric === "credits" ? "Credit Consumption" : "Operations"}{" "}
            {granularity === "day" ? "Daily" : granularity === "week" ? "Weekly" : "Monthly"} Trends
          </h2>
          <div className="flex items-center gap-3">
            {/* Metric selector */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["tokens", "credits", "ops"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    chartMetric === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "tokens" ? "Tokens" : m === "credits" ? "Credits" : "Operations"}
                </button>
              ))}
            </div>
            {/* Granularity selector */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["day", "week", "month"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    granularity === g ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {g === "day" ? "Daily" : g === "week" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <TokenChart points={chartPoints} metric={chartMetric} />
      </section>

      {/* Daily Usage */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Token Usage</h2>
        {dailyUsage.length === 0 ? (
          <p className="text-sm text-gray-400">No daily usage data available.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dailyUsage.map((row) => (
              <div key={row.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">{row.date}</span>
                <MiniBar value={row.tokens_used} max={maxDailyTokens} color="blue" />
                <span className="text-xs font-medium text-gray-700 w-20 text-right">{fmtNum(row.tokens_used)}</span>
                <span className="text-xs text-gray-400 w-16 text-right">{row.operation_count} ops</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* By Operation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Operation</h2>
        {byOperation.length === 0 ? (
          <p className="text-sm text-gray-400">No operation data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2 pr-4">Operation</th>
                  <th className="py-2 pr-4">Calls</th>
                  <th className="py-2 pr-4">Total Tokens</th>
                  <th className="py-2 pr-4">Avg Tokens/Call</th>
                  <th className="py-2 pr-4">Credits</th>
                  <th className="py-2 pr-4 w-48">Share</th>
                </tr>
              </thead>
              <tbody>
                {byOperation.map((op) => (
                  <tr key={op.operation} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-700">{op.operation}</td>
                    <td className="py-2 pr-4">{fmtNum(op.count)}</td>
                    <td className="py-2 pr-4">{fmtNum(op.total_tokens)}</td>
                    <td className="py-2 pr-4">{fmtNum(op.avg_tokens_per_call)}</td>
                    <td className="py-2 pr-4">{fmtNum(op.total_credits)}</td>
                    <td className="py-2 pr-4"><MiniBar value={op.total_tokens} max={maxOpTokens} color="purple" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top Users */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Users by Token Usage</h2>
        {byUser.length === 0 ? (
          <p className="text-sm text-gray-400">No user data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Calls</th>
                  <th className="py-2 pr-4">Tokens</th>
                  <th className="py-2 pr-4">Credits</th>
                  <th className="py-2 pr-4 w-48">Share</th>
                </tr>
              </thead>
              <tbody>
                {byUser.map((u, i) => (
                  <tr key={u.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-4 font-medium text-gray-700">{u.email}</td>
                    <td className="py-2 pr-4">{fmtNum(u.count)}</td>
                    <td className="py-2 pr-4">{fmtNum(u.total_tokens)}</td>
                    <td className="py-2 pr-4">{fmtNum(u.total_credits)}</td>
                    <td className="py-2 pr-4"><MiniBar value={u.total_tokens} max={maxUserTokens} color="green" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
