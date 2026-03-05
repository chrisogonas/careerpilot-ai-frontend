"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import { AdminRevenueDetailed } from "@/lib/types";

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

function cents(c: number): string {
  return `$${(c / 100).toFixed(2)}`;
}

/* ── page ─────────────────────────────────────────────────────── */
export default function RevenuePage() {
  const [data, setData] = useState<AdminRevenueDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [days, setDays] = useState(90);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiClient.getRevenueDetailed(days);
      setData(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading revenue data…</div>;
  if (err) return <div className="p-8 text-center text-red-500">{err}</div>;
  if (!data) return null;

  const dailyMrr = data.daily_mrr ?? [];
  const churnWaterfall = data.churn_waterfall ?? [];
  const cohortRetention = data.cohort_retention ?? [];
  const funnel = data.conversion_funnel ?? { total_users: 0, free_users: 0, pro_users: 0, premium_users: 0, conversion_rate: 0 };
  const latestMRR = dailyMrr.length > 0 ? dailyMrr[dailyMrr.length - 1].mrr_cents : 0;
  const maxMRR = Math.max(...dailyMrr.map((d) => d.mrr_cents), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📈 Revenue Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed MRR, churn, cohort, and conversion insights</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>1 year</option>
          </select>
          <button onClick={load} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Current MRR" value={cents(latestMRR)} color="green" />
        <KPI label="Estimated ARR" value={cents(latestMRR * 12)} color="blue" />
        <KPI label="Total LTV" value={cents(data.total_ltv_cents)} sub="All paying users" color="purple" />
        <KPI label="Avg LTV / User" value={cents(data.avg_ltv_cents)} color="yellow" />
      </div>

      {/* Conversion Funnel */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {[
            { label: "Total Users", val: funnel.total_users, color: "gray" },
            { label: "Free", val: funnel.free_users, color: "blue" },
            { label: "Pro", val: funnel.pro_users, color: "green" },
            { label: "Premium", val: funnel.premium_users, color: "purple" },
            { label: "Conversion", val: `${funnel.conversion_rate.toFixed(1)}%`, color: "yellow" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs text-gray-400 uppercase font-semibold">{item.label}</p>
              <p className="text-xl font-bold text-gray-900">{item.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily MRR Chart (ascii bar style) */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily MRR Trend</h2>
        {dailyMrr.length === 0 ? (
          <p className="text-sm text-gray-400">No MRR data available for this period.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dailyMrr.map((row) => (
              <div key={row.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">{row.date}</span>
                <MiniBar value={row.mrr_cents} max={maxMRR} color="green" />
                <span className="text-xs font-medium text-gray-700 w-20 text-right">{cents(row.mrr_cents)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Churn Waterfall */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Churn Waterfall</h2>
        {churnWaterfall.length === 0 ? (
          <p className="text-sm text-gray-400">No churn data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4 text-green-600">Upgrades</th>
                  <th className="py-2 pr-4 text-yellow-600">Downgrades</th>
                  <th className="py-2 pr-4 text-red-600">Churns</th>
                  <th className="py-2 pr-4 text-blue-600">Reactivations</th>
                  <th className="py-2 pr-4">Net MRR Δ</th>
                </tr>
              </thead>
              <tbody>
                {churnWaterfall.map((row) => (
                  <tr key={row.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-700">{row.date}</td>
                    <td className="py-2 pr-4 text-green-700">{row.upgrades}</td>
                    <td className="py-2 pr-4 text-yellow-700">{row.downgrades}</td>
                    <td className="py-2 pr-4 text-red-700">{row.churns}</td>
                    <td className="py-2 pr-4 text-blue-700">{row.reactivations}</td>
                    <td className={`py-2 pr-4 font-semibold ${row.net_mrr_change_cents >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {row.net_mrr_change_cents >= 0 ? "+" : ""}{cents(row.net_mrr_change_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cohort Retention */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention</h2>
        {cohortRetention.length === 0 ? (
          <p className="text-sm text-gray-400">No cohort data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2 pr-4">Cohort</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Day 7</th>
                  <th className="py-2 pr-4">Day 14</th>
                  <th className="py-2 pr-4">Day 30</th>
                  <th className="py-2 pr-4">Day 60</th>
                  <th className="py-2 pr-4">Day 90</th>
                </tr>
              </thead>
              <tbody>
                {cohortRetention.map((c) => (
                  <tr key={c.cohort_date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-700">{c.cohort_date}</td>
                    <td className="py-2 pr-4">{c.cohort_size}</td>
                    <td className="py-2 pr-4">{c.retention_day_7 != null ? `${c.retention_day_7}%` : "—"}</td>
                    <td className="py-2 pr-4">{c.retention_day_14 != null ? `${c.retention_day_14}%` : "—"}</td>
                    <td className="py-2 pr-4">{c.retention_day_30 != null ? `${c.retention_day_30}%` : "—"}</td>
                    <td className="py-2 pr-4">{c.retention_day_60 != null ? `${c.retention_day_60}%` : "—"}</td>
                    <td className="py-2 pr-4">{c.retention_day_90 != null ? `${c.retention_day_90}%` : "—"}</td>
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
