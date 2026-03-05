"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils/api";
import { AdminPlanConfig } from "@/lib/types";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<AdminPlanConfig[]>([]);
  const [overridableFields, setOverridableFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editPlan, setEditPlan] = useState("");
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAdminPlanConfig();
      setPlans(res.plans);
      setOverridableFields(res.overridable_fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSaveOverride = async () => {
    if (!editPlan || !editField || !editValue.trim()) return;
    setSaving(true);
    try {
      await apiClient.upsertPlanOverride(editPlan, editField, editValue);
      setEditPlan("");
      setEditField("");
      setEditValue("");
      await loadPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save override");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOverride = async (planName: string, fieldName: string) => {
    if (!confirm(`Revert ${planName}.${fieldName} to code default?`)) return;
    try {
      await apiClient.deletePlanOverride(planName, fieldName);
      await loadPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete override");
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
        <h1 className="text-2xl font-bold text-gray-900">Plan Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Override plan defaults. Overridden values are highlighted in blue.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const overrideFields = new Set(plan.overrides.map((o) => o.field_name));
          return (
            <div key={plan.plan_name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 capitalize">{plan.display_name}</h2>
                <span className="text-sm font-medium text-gray-500">{plan.plan_name}</span>
              </div>
              <p className="text-sm text-gray-500">{plan.description}</p>

              <dl className="space-y-2 text-sm">
                <Field
                  label="Monthly Credits"
                  value={plan.monthly_credits}
                  override={overrideFields.has("monthly_credits")}
                  onDelete={() => handleDeleteOverride(plan.plan_name, "monthly_credits")}
                />
                <Field
                  label="Price (Monthly)"
                  value={formatCents(plan.price_monthly_cents)}
                  override={overrideFields.has("price_monthly_cents")}
                  onDelete={() => handleDeleteOverride(plan.plan_name, "price_monthly_cents")}
                />
                <Field
                  label="Price (Yearly)"
                  value={formatCents(plan.price_yearly_cents)}
                  override={overrideFields.has("price_yearly_cents")}
                  onDelete={() => handleDeleteOverride(plan.plan_name, "price_yearly_cents")}
                />
                <Field
                  label="Price USD"
                  value={`$${plan.price_usd.toFixed(2)}`}
                  override={overrideFields.has("price_usd")}
                  onDelete={() => handleDeleteOverride(plan.plan_name, "price_usd")}
                />
                <Field
                  label="Max Resumes"
                  value={plan.max_resumes < 0 ? "Unlimited" : plan.max_resumes}
                  override={overrideFields.has("max_resumes")}
                  onDelete={() => handleDeleteOverride(plan.plan_name, "max_resumes")}
                />
                <Field
                  label="Email Reminder Limit"
                  value={plan.email_reminder_limit}
                  override={overrideFields.has("email_reminder_limit")}
                  onDelete={() => handleDeleteOverride(plan.plan_name, "email_reminder_limit")}
                />
              </dl>

              {/* Features */}
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Features</p>
                <ul className="space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Override Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Create / Update Override</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={editPlan}
            onChange={(e) => setEditPlan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select plan...</option>
            {plans.map((p) => (
              <option key={p.plan_name} value={p.plan_name}>
                {p.display_name}
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
            disabled={saving || !editPlan || !editField || !editValue.trim()}
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
        <span className={override ? "text-blue-600 font-semibold" : "text-gray-900"}>
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
