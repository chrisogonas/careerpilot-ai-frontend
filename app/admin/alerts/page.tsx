"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import { AlertThresholdData, AlertHistoryItem } from "@/lib/types";

function Badge({ text, color }: { text: string; color: "green" | "yellow" | "red" | "blue" | "gray" }) {
  const map: Record<string, string> = { green: "bg-green-100 text-green-800", yellow: "bg-yellow-100 text-yellow-800", red: "bg-red-100 text-red-800", blue: "bg-blue-100 text-blue-800", gray: "bg-gray-100 text-gray-700" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{text}</span>;
}

const METRIC_OPTIONS = [
  "error_rate_percent", "p50_latency_ms", "p95_latency_ms", "p99_latency_ms",
  "avg_latency_ms", "webhook_failure_rate_percent", "email_failure_rate_percent",
  "requests_per_minute", "5xx_count",
];
const OPERATOR_OPTIONS = [">", "<", ">=", "<=", "=="];
const SEVERITY_OPTIONS = ["info", "warning", "critical"];
const sevColor = (s: string) => s === "critical" ? "red" : s === "warning" ? "yellow" : "blue";

export default function AlertConfigPage() {
  const [thresholds, setThresholds] = useState<AlertThresholdData[]>([]);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);
  const [tab, setTab] = useState<"config" | "history">("config");

  // Form state
  const [form, setForm] = useState({
    metric_name: METRIC_OPTIONS[0],
    operator: ">",
    threshold_value: "",
    severity: "warning",
    enabled: true,
    cooldown_minutes: 60,
    notify_email: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        apiClient.getAlertThresholds(),
        apiClient.getAlertHistory(50),
      ]);
      setThresholds(t);
      setHistory(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.threshold_value) return;
    setSaving(true);
    try {
      await apiClient.upsertAlertThreshold({
        metric_name: form.metric_name,
        operator: form.operator,
        threshold_value: Number(form.threshold_value),
        severity: form.severity,
        enabled: form.enabled,
        cooldown_minutes: form.cooldown_minutes,
        notify_email: form.notify_email,
      });
      resetForm();
      await load();
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this threshold?")) return;
    try {
      await apiClient.deleteAlertThreshold(id);
      await load();
    } catch {
      setError("Delete failed");
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await apiClient.evaluateAlerts();
      setEvalResult(res.triggered > 0 ? `${res.triggered} alert(s) triggered` : "No alerts triggered — all metrics within thresholds");
      await load();
    } catch {
      setEvalResult("Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.acknowledgeAlert(id);
      await load();
    } catch {
      setError("Acknowledge failed");
    }
  };

  const editThreshold = (t: AlertThresholdData) => {
    setForm({
      metric_name: t.metric_name,
      operator: t.operator,
      threshold_value: String(t.threshold_value),
      severity: t.severity,
      enabled: t.enabled,
      cooldown_minutes: t.cooldown_minutes,
      notify_email: true,
    });
    setEditingId(t.id);
  };

  const resetForm = () => {
    setForm({ metric_name: METRIC_OPTIONS[0], operator: ">", threshold_value: "", severity: "warning", enabled: true, cooldown_minutes: 60, notify_email: true });
    setEditingId(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (error && !thresholds.length) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-600 font-medium">{error}</p><button onClick={load} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Retry</button></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Set thresholds for error rate, latency, and more</p>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={evaluating}
          className="text-sm px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {evaluating ? "Evaluating…" : "🔔 Evaluate Now"}
        </button>
      </div>

      {evalResult && (
        <div className={`p-3 rounded-lg text-sm font-medium ${evalResult.includes("triggered") && !evalResult.includes("No") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {evalResult}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["config", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium -mb-px ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "config" ? "Thresholds" : `History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === "config" && (
        <>
          {/* Upsert form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? "Edit Threshold" : "Add Threshold"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric</label>
                <select value={form.metric_name} onChange={e => setForm({ ...form, metric_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {METRIC_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
                <select value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {OPERATOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Threshold Value</label>
                <input type="number" step="any" value={form.threshold_value} onChange={e => setForm({ ...form, threshold_value: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cooldown (min)</label>
                <input type="number" value={form.cooldown_minutes} onChange={e => setForm({ ...form, cooldown_minutes: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} className="rounded" />
                  Enabled
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.notify_email} onChange={e => setForm({ ...form, notify_email: e.target.checked })} className="rounded" />
                  Email
                </label>
              </div>
              <div className="flex items-end gap-2 lg:col-span-2">
                <button onClick={handleSave} disabled={saving || !form.threshold_value} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">{saving ? "Saving…" : editingId ? "Update" : "Create"}</button>
                {editingId && <button onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Cancel</button>}
              </div>
            </div>
          </div>

          {/* Existing thresholds */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Thresholds ({thresholds.length})</h2>
            {thresholds.length === 0 ? (
              <p className="text-sm text-gray-400">No thresholds configured</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="text-left px-3 py-2">Metric</th>
                      <th className="text-center px-3 py-2">Condition</th>
                      <th className="text-center px-3 py-2">Severity</th>
                      <th className="text-center px-3 py-2">Enabled</th>
                      <th className="text-right px-3 py-2">Cooldown</th>
                      <th className="text-left px-3 py-2">Last Triggered</th>
                      <th className="text-right px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {thresholds.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-mono text-xs">{t.metric_name}</td>
                        <td className="px-3 py-1.5 text-center font-mono text-xs">{t.operator} {t.threshold_value}</td>
                        <td className="px-3 py-1.5 text-center"><Badge text={t.severity} color={sevColor(t.severity)} /></td>
                        <td className="px-3 py-1.5 text-center">{t.enabled ? "✅" : "⏸️"}</td>
                        <td className="px-3 py-1.5 text-right">{t.cooldown_minutes}m</td>
                        <td className="px-3 py-1.5 text-xs text-gray-500">{t.last_triggered_at ? new Date(t.last_triggered_at).toLocaleString() : "Never"}</td>
                        <td className="px-3 py-1.5 text-right space-x-2">
                          <button onClick={() => editThreshold(t)} className="text-blue-600 hover:underline text-xs">Edit</button>
                          <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No alerts have been triggered yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-white">
                  <tr>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Metric</th>
                    <th className="text-center px-3 py-2">Value</th>
                    <th className="text-center px-3 py-2">Threshold</th>
                    <th className="text-center px-3 py-2">Severity</th>
                    <th className="text-left px-3 py-2">Message</th>
                    <th className="text-center px-3 py-2">Ack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 text-xs text-gray-600 whitespace-nowrap">{a.created_at ? new Date(a.created_at).toLocaleString() : "-"}</td>
                      <td className="px-3 py-1.5 font-mono text-xs">{a.metric_name}</td>
                      <td className="px-3 py-1.5 text-center font-mono">{a.metric_value}</td>
                      <td className="px-3 py-1.5 text-center font-mono">{a.threshold_value}</td>
                      <td className="px-3 py-1.5 text-center"><Badge text={a.severity} color={sevColor(a.severity)} /></td>
                      <td className="px-3 py-1.5 text-xs text-gray-600 truncate max-w-[260px]">{a.message}</td>
                      <td className="px-3 py-1.5 text-center">
                        {a.acknowledged ? (
                          <span className="text-green-600 text-xs">✔ Acked</span>
                        ) : (
                          <button onClick={() => handleAcknowledge(a.id)} className="text-xs text-blue-600 hover:underline">Ack</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
