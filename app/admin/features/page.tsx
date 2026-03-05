"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import { AdminFeatureFlag } from "@/lib/types";

/* ── helpers ──────────────────────────────────────────────────── */

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

/* ── page ─────────────────────────────────────────────────────── */
export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEnabled, setNewEnabled] = useState(false);
  const [newTargetType, setNewTargetType] = useState("global");
  const [newTargetValue, setNewTargetValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterTarget, setFilterTarget] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiClient.getFeatureFlags();
      setFlags(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await apiClient.createFeatureFlag({
        flag_name: newName.trim(),
        description: newDesc.trim() || undefined,
        enabled: newEnabled,
        target_type: newTargetType,
        target_value: newTargetValue.trim() || undefined,
      });
      setNewName("");
      setNewDesc("");
      setNewEnabled(false);
      setNewTargetType("global");
      setNewTargetValue("");
      setShowCreate(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create flag");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (flag: AdminFeatureFlag) => {
    try {
      await apiClient.updateFeatureFlag(flag.id, { enabled: !flag.enabled });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to toggle flag");
    }
  };

  const handleDelete = async (flag: AdminFeatureFlag) => {
    if (!confirm(`Delete flag "${flag.flag_name}"?`)) return;
    try {
      await apiClient.deleteFeatureFlag(flag.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete flag");
    }
  };

  const filtered = filterTarget === "all" ? flags : flags.filter((f) => f.target_type === filterTarget);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading feature flags…</div>;
  if (err) return <div className="p-8 text-center text-red-500">{err}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🚩 Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-1">Toggle features globally, per plan, or per user</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterTarget}
            onChange={(e) => setFilterTarget(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="all">All targets</option>
            <option value="global">Global</option>
            <option value="plan">Plan</option>
            <option value="user">User</option>
          </select>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            {showCreate ? "Cancel" : "+ New Flag"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Create Feature Flag</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flag Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. enable_ai_v2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional description"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
              <select
                value={newTargetType}
                onChange={(e) => setNewTargetType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="global">Global</option>
                <option value="plan">Plan</option>
                <option value="user">User</option>
              </select>
            </div>
            {newTargetType !== "global" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value {newTargetType === "plan" ? "(plan name)" : "(user email or ID)"}
                </label>
                <input
                  type="text"
                  value={newTargetValue}
                  onChange={(e) => setNewTargetValue(e.target.value)}
                  placeholder={newTargetType === "plan" ? "e.g. pro" : "e.g. user@email.com"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newEnabled}
                onChange={(e) => setNewEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              Enabled on creation
            </label>
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create Flag"}
            </button>
          </div>
        </section>
      )}

      {/* Flags Table */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filtered.length} flag{filtered.length !== 1 ? "s" : ""}
          </h2>
          <button onClick={load} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No feature flags found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2 pr-4">Flag Name</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Target</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((flag) => (
                  <tr key={flag.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{flag.flag_name}</td>
                    <td className="py-3 pr-4 text-gray-500 max-w-xs truncate">{flag.description || "—"}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        text={flag.target_type}
                        color={flag.target_type === "global" ? "blue" : flag.target_type === "plan" ? "yellow" : "gray"}
                      />
                      {flag.target_value && (
                        <span className="ml-1 text-xs text-gray-500">({flag.target_value})</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleToggle(flag)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          flag.enabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={flag.enabled ? "Click to disable" : "Click to enable"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            flag.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {new Date(flag.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => handleDelete(flag)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
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
