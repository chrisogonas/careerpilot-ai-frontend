"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/utils/api";
import { AdminDashboardData, AdminRevenueSummary } from "@/lib/types";

function StatCard({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}) {
  const ring: Record<string, string> = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    yellow: "border-l-yellow-500",
    red: "border-l-red-500",
    purple: "border-l-purple-500",
  };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${ring[color]} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [revenue, setRevenue] = useState<AdminRevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, revRes] = await Promise.all([
          apiClient.getAdminDashboard(),
          apiClient.getRevenueSummary(),
        ]);
        setDashboard(dashRes);
        setRevenue(revRes.revenue);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const d = dashboard!;
  const r = revenue;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">System metrics &amp; overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={d.total_users.toLocaleString()} color="blue" />
        <StatCard label="Active Today" value={d.active_users_today} color="green" />
        <StatCard label="API Calls Today" value={d.api_calls_today.toLocaleString()} color="purple" />
        <StatCard
          label="Error Rate"
          value={`${d.error_rate_percent.toFixed(1)}%`}
          sub={`${d.errors_today} errors today`}
          color={d.error_rate_percent > 5 ? "red" : "green"}
        />
      </div>

      {/* Revenue Row */}
      {r && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="MRR"
            value={`$${(r.mrr_cents / 100).toFixed(2)}`}
            sub={`ARR $${(r.arr_cents / 100).toFixed(2)}`}
            color="green"
          />
          <StatCard label="Paying Users" value={r.total_paying_users} color="blue" />
          <StatCard
            label="Churn (30d)"
            value={r.churn_count_30d}
            color={r.churn_count_30d > 5 ? "red" : "yellow"}
          />
          <StatCard label="Grace Periods" value={r.active_grace_periods} color="yellow" />
        </div>
      )}

      {/* Subscriptions by Plan */}
      {r && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscriptions by Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(r.subscriptions_by_plan).map(([plan, count]) => (
              <div key={plan} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-500 capitalize">{plan}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Endpoints */}
      {d.top_endpoints && d.top_endpoints.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Endpoint</th>
                  <th className="pb-2 font-medium text-right">Calls</th>
                </tr>
              </thead>
              <tbody>
                {d.top_endpoints.map((ep, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs text-gray-700">{ep.endpoint}</td>
                    <td className="py-2 text-right text-gray-900 font-medium">{ep.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/users"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-400 transition group"
        >
          <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">User Management</p>
          <p className="text-sm text-gray-500 mt-1">Search, suspend &amp; manage users</p>
        </Link>
        <Link
          href="/admin/plans"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-400 transition group"
        >
          <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Plan Config</p>
          <p className="text-sm text-gray-500 mt-1">Override pricing &amp; limits</p>
        </Link>
        <Link
          href="/admin/audit"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-400 transition group"
        >
          <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Audit Log</p>
          <p className="text-sm text-gray-500 mt-1">View admin action history</p>
        </Link>
      </div>
    </div>
  );
}
