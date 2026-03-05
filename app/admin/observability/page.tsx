"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import {
  SystemHealthData,
  LatencyPercentilesData,
  LatencyTimeseriesPoint,
  EndpointHeatmapItem,
  ErrorBreakdownData,
} from "@/lib/types";

/* ── tiny helpers ───────────────────────────────────────────────── */

function Badge({ text, color }: { text: string; color: "green" | "yellow" | "red" | "blue" | "gray" }) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-700",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{text}</span>;
}

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

/* ── simple ASCII-art sparkline bar (no charting lib needed) ─── */
function MiniBar({ value, max, color = "blue" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const bg: Record<string, string> = { blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500", yellow: "bg-yellow-400" };
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`${bg[color] || "bg-blue-500"} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────────── */
export default function ObservabilityPage() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [latency, setLatency] = useState<LatencyPercentilesData | null>(null);
  const [timeseries, setTimeseries] = useState<LatencyTimeseriesPoint[]>([]);
  const [heatmap, setHeatmap] = useState<EndpointHeatmapItem[]>([]);
  const [errors, setErrors] = useState<ErrorBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [hours, setHours] = useState(24);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, l, ts, ep, er] = await Promise.all([
        apiClient.getSystemHealth(),
        apiClient.getLatencyPercentiles(hours),
        apiClient.getLatencyTimeseries(hours, 15),
        apiClient.getEndpointHeatmap(hours),
        apiClient.getErrorBreakdown(hours),
      ]);
      setHealth(h);
      setLatency(l);
      setTimeseries(ts);
      setHeatmap(ep);
      setErrors(er);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load observability data");
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (err) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-600 font-medium">{err}</p><button onClick={load} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Retry</button></div>;

  const h = health!;
  const statusColor = h.status === "healthy" ? "green" : h.status === "degraded" ? "yellow" : "red";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Observability</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time health, latency &amp; error monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge text={h.status.toUpperCase()} color={statusColor} />
          <select value={hours} onChange={e => setHours(Number(e.target.value))} className="text-sm border rounded-lg px-3 py-1.5 bg-white">
            <option value={1}>Last 1h</option>
            <option value={6}>Last 6h</option>
            <option value={24}>Last 24h</option>
            <option value={72}>Last 3d</option>
            <option value={168}>Last 7d</option>
          </select>
          <button onClick={load} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Refresh</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="RPM (5 min)" value={h.last_5_min.rpm} color="blue" />
        <KPI label="Avg Latency" value={`${h.last_5_min.avg_latency_ms} ms`} color="green" />
        <KPI label="5xx Errors (1h)" value={h.last_hour.errors_5xx} color="red" />
        <KPI label="Error Rate (1h)" value={`${h.last_hour.error_rate_percent}%`} color="yellow" />
        <KPI label="Requests (1h)" value={h.last_hour.requests.toLocaleString()} color="purple" />
      </div>

      {/* Latency percentiles */}
      {latency && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latency Percentiles ({hours}h)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{latency.p50_ms}</p>
              <p className="text-xs text-gray-500 mt-1">P50 (ms)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{latency.p95_ms}</p>
              <p className="text-xs text-gray-500 mt-1">P95 (ms)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{latency.p99_ms}</p>
              <p className="text-xs text-gray-500 mt-1">P99 (ms)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">{latency.avg_ms}</p>
              <p className="text-xs text-gray-500 mt-1">Avg (ms)</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">{latency.total_requests.toLocaleString()} total requests</p>
        </div>
      )}

      {/* Time series table (lightweight, no charting lib) */}
      {timeseries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latency Over Time</h2>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-white">
                <tr><th className="text-left px-3 py-2">Time</th><th className="text-right px-3 py-2">Avg (ms)</th><th className="text-right px-3 py-2">P95 (ms)</th><th className="text-right px-3 py-2">Requests</th><th className="text-right px-3 py-2">Errors</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timeseries.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{p.time ? new Date(p.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{p.avg_ms}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{p.p95_ms}</td>
                    <td className="px-3 py-1.5 text-right">{p.requests}</td>
                    <td className="px-3 py-1.5 text-right">{p.errors > 0 ? <span className="text-red-600 font-semibold">{p.errors}</span> : "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Endpoint heatmap */}
      {heatmap.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Method</th>
                  <th className="text-left px-3 py-2">Endpoint</th>
                  <th className="text-right px-3 py-2">Calls</th>
                  <th className="px-3 py-2 w-32">Volume</th>
                  <th className="text-right px-3 py-2">Avg (ms)</th>
                  <th className="text-right px-3 py-2">P95 (ms)</th>
                  <th className="text-right px-3 py-2">Errors</th>
                  <th className="text-right px-3 py-2">Err %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {heatmap.map((ep, i) => {
                  const maxCalls = heatmap[0]?.calls || 1;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5"><Badge text={ep.method} color="blue" /></td>
                      <td className="px-3 py-1.5 font-mono text-xs truncate max-w-[260px]">{ep.endpoint}</td>
                      <td className="px-3 py-1.5 text-right">{ep.calls}</td>
                      <td className="px-3 py-1.5"><MiniBar value={ep.calls} max={maxCalls} /></td>
                      <td className="px-3 py-1.5 text-right font-mono">{ep.avg_ms}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{ep.p95_ms}</td>
                      <td className="px-3 py-1.5 text-right">{ep.errors > 0 ? <span className="text-red-600">{ep.errors}</span> : "0"}</td>
                      <td className="px-3 py-1.5 text-right">{ep.error_rate_percent > 0 ? <span className="text-red-600">{ep.error_rate_percent}%</span> : "0%"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error breakdown */}
      {errors && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Errors by Status Code</h2>
            {errors.by_status_code.length === 0 ? (
              <p className="text-sm text-gray-400">No errors in the time window</p>
            ) : (
              <div className="space-y-2">
                {errors.by_status_code.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Badge text={String(s.status_code)} color={s.status_code >= 500 ? "red" : "yellow"} />
                    <span className="text-sm font-semibold text-gray-700">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Error Endpoints</h2>
            {errors.top_error_endpoints.length === 0 ? (
              <p className="text-sm text-gray-400">None</p>
            ) : (
              <div className="space-y-2">
                {errors.top_error_endpoints.map((e, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono truncate flex-1">{e.method} {e.endpoint}</span>
                    <span className="text-sm font-semibold text-red-600">{e.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
