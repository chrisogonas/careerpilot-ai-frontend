"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import { WebhookHealthData } from "@/lib/types";

function Badge({ text, color }: { text: string; color: "green" | "yellow" | "red" | "blue" | "gray" }) {
  const map: Record<string, string> = { green: "bg-green-100 text-green-800", yellow: "bg-yellow-100 text-yellow-800", red: "bg-red-100 text-red-800", blue: "bg-blue-100 text-blue-800", gray: "bg-gray-100 text-gray-700" };
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

/* Success-rate gauge (CSS ring) */
function RateGauge({ rate, size = 120 }: { rate: number; size?: number }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const color = rate >= 95 ? "#22c55e" : rate >= 80 ? "#eab308" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" className="text-lg font-bold" fill={color}>{rate}%</text>
      </svg>
      <p className="text-xs text-gray-500 mt-1">Success Rate</p>
    </div>
  );
}

export default function WebhookHealthPage() {
  const [data, setData] = useState<WebhookHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(24);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiClient.getWebhookHealth(hours));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load webhook health");
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-600 font-medium">{error}</p><button onClick={load} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Retry</button></div>;

  const d = data!;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Health</h1>
          <p className="text-sm text-gray-500 mt-1">Delivery stats &amp; endpoint monitoring</p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* KPIs + Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-1 flex justify-center">
          <RateGauge rate={d.success_rate_percent} />
        </div>
        <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Total Deliveries" value={d.total_deliveries.toLocaleString()} color="blue" />
          <KPI label="Successful" value={d.successful.toLocaleString()} color="green" />
          <KPI label="Failed" value={d.failed.toLocaleString()} color="red" />
          <KPI label="Avg Duration" value={`${d.avg_duration_ms} ms`} color="purple" />
        </div>
      </div>

      {/* Per-endpoint table */}
      {d.endpoints.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-3 py-2">URL</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Deliveries</th>
                  <th className="text-right px-3 py-2">OK</th>
                  <th className="text-right px-3 py-2">Rate</th>
                  <th className="text-right px-3 py-2">Consec. Fails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {d.endpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-mono text-xs truncate max-w-[300px]">{ep.url}</td>
                    <td className="px-3 py-1.5 text-center">
                      <Badge text={ep.active ? "Active" : "Inactive"} color={ep.active ? "green" : "gray"} />
                    </td>
                    <td className="px-3 py-1.5 text-right">{ep.deliveries}</td>
                    <td className="px-3 py-1.5 text-right text-green-600">{ep.successes}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={ep.success_rate_percent >= 95 ? "text-green-600" : ep.success_rate_percent >= 80 ? "text-yellow-600" : "text-red-600"}>
                        {ep.success_rate_percent}%
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">{ep.consecutive_failures > 0 ? <span className="text-red-600 font-semibold">{ep.consecutive_failures}</span> : "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent failures */}
      {d.recent_failures.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Failures</h2>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-white">
                <tr>
                  <th className="text-left px-3 py-2">Time</th>
                  <th className="text-left px-3 py-2">Endpoint</th>
                  <th className="text-right px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {d.recent_failures.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap text-xs">{f.at ? new Date(f.at).toLocaleString() : "-"}</td>
                    <td className="px-3 py-1.5 font-mono text-xs truncate max-w-[200px]">{f.endpoint_url}</td>
                    <td className="px-3 py-1.5 text-right"><Badge text={f.status_code ? String(f.status_code) : "ERR"} color="red" /></td>
                    <td className="px-3 py-1.5 text-xs text-gray-600 truncate max-w-[240px]">{f.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {d.total_deliveries === 0 && d.endpoints.length === 0 && (
        <div className="bg-gray-50 rounded-xl border p-8 text-center">
          <p className="text-gray-500">No webhook deliveries in the selected time window.</p>
        </div>
      )}
    </div>
  );
}
