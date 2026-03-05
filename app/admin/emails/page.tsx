"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import { EmailStatsData } from "@/lib/types";

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

export default function EmailMonitoringPage() {
  const [stats, setStats] = useState<EmailStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getEmailStats(days);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load email stats");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-600 font-medium">{error}</p><button onClick={load} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Retry</button></div>;

  const d = stats!;
  const typeEntries = Object.entries(d.by_type);
  const maxDaily = d.daily_trend.reduce((m, p) => Math.max(m, p.count), 0);
  const maxSender = d.top_senders.length > 0 ? d.top_senders[0].count : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">Email delivery stats &amp; usage tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="text-sm border rounded-lg px-3 py-1.5 bg-white">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button onClick={load} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Refresh</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Emails Sent" value={d.total_sent.toLocaleString()} color="blue" sub={`Last ${d.days} days`} />
        <KPI label="Avg / Day" value={d.daily_trend.length > 0 ? Math.round(d.total_sent / d.daily_trend.length) : 0} color="green" />
        <KPI label="Email Types" value={typeEntries.length} color="purple" />
        <KPI label="Unique Senders" value={d.top_senders.length} sub="Top 10 shown" color="yellow" />
      </div>

      {/* By type */}
      {typeEntries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emails by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {typeEntries.map(([type, count]) => (
              <div key={type} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{type.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily trend table */}
      {d.daily_trend.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Trend</h2>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-white">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-right px-3 py-2">Count</th>
                  <th className="px-3 py-2 w-48">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {d.daily_trend.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 text-gray-600">{p.date}</td>
                    <td className="px-3 py-1.5 text-right font-semibold">{p.count}</td>
                    <td className="px-3 py-1.5"><MiniBar value={p.count} max={maxDaily} color="blue" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top senders */}
      {d.top_senders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Senders (by user ID)</h2>
          <div className="space-y-3">
            {d.top_senders.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-6 text-right">{i + 1}.</span>
                <span className="text-xs font-mono text-gray-600 truncate w-56">{s.user_id}</span>
                <div className="flex-1"><MiniBar value={s.count} max={maxSender} color="purple" /></div>
                <span className="text-sm font-semibold text-gray-700 w-10 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
