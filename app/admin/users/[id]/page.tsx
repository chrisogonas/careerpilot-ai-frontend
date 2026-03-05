"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/utils/api";
import { AdminUserDetail } from "@/lib/types";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Credit adjustment
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");

  // Suspend reason
  const [suspendReason, setSuspendReason] = useState("");

  // Grace extension
  const [graceDays, setGraceDays] = useState("");

  const loadUser = async () => {
    try {
      const res = await apiClient.getAdminUserDetail(userId);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return alert("Please enter a reason");
    setActionLoading(true);
    try {
      await apiClient.suspendUser(userId, suspendReason);
      setSuspendReason("");
      await loadUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to suspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setActionLoading(true);
    try {
      await apiClient.unsuspendUser(userId, "Admin reactivation");
      await loadUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unsuspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreditAdjust = async () => {
    const amt = parseInt(creditAmount);
    if (isNaN(amt) || amt === 0) return alert("Enter a non-zero amount");
    if (!creditReason.trim()) return alert("Enter a reason");
    setActionLoading(true);
    try {
      await apiClient.adjustCredits(userId, amt, creditReason);
      setCreditAmount("");
      setCreditReason("");
      await loadUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to adjust credits");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendGrace = async () => {
    if (!user?.subscription_id) return alert("No subscription to extend");
    const days = parseInt(graceDays);
    if (isNaN(days) || days < 1 || days > 90) return alert("Days must be between 1 and 90");
    setActionLoading(true);
    try {
      await apiClient.extendGracePeriod(user.subscription_id, days);
      setGraceDays("");
      await loadUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to extend grace period");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error || "User not found"}</p>
        <button onClick={() => router.back()} className="mt-3 text-sm text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const isSuspended = user.is_verified === "suspended";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/users" className="hover:text-blue-600">Users</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{user.email}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.full_name || user.email}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSuspended
              ? "bg-red-100 text-red-700"
              : user.is_verified === "verified"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {user.is_verified}
        </span>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">ID</dt>
              <dd className="font-mono text-xs text-gray-700">{user.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Joined</dt>
              <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Login</dt>
              <dd>{user.last_login ? new Date(user.last_login).toLocaleString() : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">API Calls (month)</dt>
              <dd>{user.api_calls_month}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Resumes</dt>
              <dd>{user.resume_count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Applications</dt>
              <dd>{user.application_count}</dd>
            </div>
          </dl>
        </div>

        {/* Right: Subscription Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Plan</dt>
              <dd className="capitalize font-medium">{user.plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd>{user.subscription_status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Credits</dt>
              <dd>{user.credits_remaining}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Purchased Credits</dt>
              <dd>
                {user.purchased_credits}
                {user.purchased_credits_expires_at && (
                  <span className="text-xs text-gray-400 ml-1">
                    (exp {new Date(user.purchased_credits_expires_at).toLocaleDateString()})
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Current Period</dt>
              <dd className="text-xs">
                {user.current_period_start
                  ? `${new Date(user.current_period_start).toLocaleDateString()} — ${new Date(user.current_period_end!).toLocaleDateString()}`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Grace Period End</dt>
              <dd>
                {user.grace_period_end
                  ? new Date(user.grace_period_end).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
            {user.stripe_customer_id && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Stripe Customer</dt>
                <dd className="font-mono text-xs">{user.stripe_customer_id}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suspend / Unsuspend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isSuspended ? "Unsuspend User" : "Suspend User"}
          </h2>
          {isSuspended ? (
            <button
              onClick={handleUnsuspend}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Unsuspend Account"}
            </button>
          ) : (
            <>
              <input
                type="text"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason for suspension..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Suspend Account"}
              </button>
            </>
          )}
        </div>

        {/* Credit Adjustment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Adjust Credits</h2>
          <input
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            placeholder="Amount (+/-)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={creditReason}
            onChange={(e) => setCreditReason(e.target.value)}
            placeholder="Reason..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreditAdjust}
            disabled={actionLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Apply Adjustment"}
          </button>
        </div>

        {/* Extend Grace */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Extend Grace Period</h2>
          <input
            type="number"
            value={graceDays}
            onChange={(e) => setGraceDays(e.target.value)}
            placeholder="Days (1-90)"
            min={1}
            max={90}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={handleExtendGrace}
            disabled={actionLoading || !user.subscription_id}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Extend Grace"}
          </button>
          {!user.subscription_id && (
            <p className="text-xs text-gray-400">No subscription to extend</p>
          )}
        </div>
      </div>
    </div>
  );
}
