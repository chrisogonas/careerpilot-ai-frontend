"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils/api";
import { AdminCreditPack, AdminCreditPackConfigResponse } from "@/lib/types";

export default function AdminCreditPacksPage() {
  const [packs, setPacks] = useState<AdminCreditPack[]>([]);
  const [overridableFields, setOverridableFields] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState<number>(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editPack, setEditPack] = useState("");
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAdminCreditPackConfig();
      setPacks(res.packs);
      setOverridableFields(res.overridable_fields);
      setExpiryDays(res.expiry_days);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load credit pack config"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handleSaveOverride = async () => {
    if (!editPack || !editField || !editValue.trim()) return;
    setSaving(true);
    try {
      await apiClient.upsertCreditPackOverride(editPack, editField, editValue);
      setEditPack("");
      setEditField("");
      setEditValue("");
      await loadPacks();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to save override"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOverride = async (packId: string, fieldName: string) => {
    if (!confirm(`Revert ${packId}.${fieldName} to code default?`)) return;
    try {
      await apiClient.deleteCreditPackOverride(packId, fieldName);
      await loadPacks();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete override"
      );
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Credit Pack Configuration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage one-time credit pack purchases. Overridden values are
          highlighted in blue.
        </p>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Global Settings
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Credit Pack Expiry:</span>
          <span className="text-gray-900 font-semibold">{expiryDays} days</span>
          <span className="text-xs text-gray-400">(code default)</span>
        </div>
      </div>

      {/* Credit Pack Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {packs.map((pack) => {
          const overrideFields = new Set(
            pack.overrides.map((o) => o.field_name)
          );
          return (
            <div
              key={pack.pack_id}
              className={`bg-white rounded-xl shadow-sm border p-6 space-y-4 ${
                pack.popular
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {pack.credits.toLocaleString()} Credits
                </h2>
                <div className="flex items-center gap-2">
                  {pack.popular && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500">{pack.description}</p>

              <dl className="space-y-2 text-sm">
                <Field
                  label="Credits"
                  value={pack.credits.toLocaleString()}
                  override={overrideFields.has("credits")}
                  onDelete={() =>
                    handleDeleteOverride(pack.pack_id, "credits")
                  }
                />
                <Field
                  label="Price (cents)"
                  value={formatCents(pack.price_cents)}
                  override={overrideFields.has("price_cents")}
                  onDelete={() =>
                    handleDeleteOverride(pack.pack_id, "price_cents")
                  }
                />
                <Field
                  label="Price USD"
                  value={`$${pack.price_usd.toFixed(2)}`}
                  override={overrideFields.has("price_usd")}
                  onDelete={() =>
                    handleDeleteOverride(pack.pack_id, "price_usd")
                  }
                />
                <Field
                  label="Name"
                  value={pack.name}
                  override={overrideFields.has("name")}
                  onDelete={() =>
                    handleDeleteOverride(pack.pack_id, "name")
                  }
                />
                <Field
                  label="Description"
                  value={pack.description}
                  override={overrideFields.has("description")}
                  onDelete={() =>
                    handleDeleteOverride(pack.pack_id, "description")
                  }
                />
                <Field
                  label="Popular"
                  value={pack.popular ? "Yes" : "No"}
                  override={overrideFields.has("popular")}
                  onDelete={() =>
                    handleDeleteOverride(pack.pack_id, "popular")
                  }
                />
              </dl>

              {/* Value indicator */}
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Value
                </p>
                <p className="text-sm text-gray-700">
                  {(pack.credits / pack.price_usd).toFixed(1)} credits per $1
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Override Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Create / Update Override
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={editPack}
            onChange={(e) => setEditPack(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select pack...</option>
            {packs.map((p) => (
              <option key={p.pack_id} value={p.pack_id}>
                {p.name} ({p.pack_id})
              </option>
            ))}
          </select>
          <select
            value={editField}
            onChange={(e) => setEditField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select field...</option>
            {overridableFields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="New value"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveOverride}
            disabled={
              saving || !editPack || !editField || !editValue.trim()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Override"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  override,
  onDelete,
}: {
  label: string;
  value: string | number;
  override: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="flex items-center gap-2">
        <span
          className={
            override ? "text-blue-600 font-semibold" : "text-gray-900"
          }
        >
          {value}
        </span>
        {override && (
          <button
            onClick={onDelete}
            className="text-xs text-red-500 hover:text-red-700"
            title="Revert to default"
          >
            ✕
          </button>
        )}
      </dd>
    </div>
  );
}
