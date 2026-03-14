"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";
import type { ReferralStatsOut, ReferralOut } from "@/lib/types";
import {
  Gift,
  Copy,
  Check,
  Users,
  Award,
  Coins,
  ExternalLink,
} from "lucide-react";

export default function ReferralsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<ReferralStatsOut | null>(null);
  const [referrals, setReferrals] = useState<ReferralOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getReferralList();
      setStats(data.stats);
      setReferrals(data.referrals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const handleCopy = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = stats.referral_link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gift className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refer a Friend</h1>
          <p className="text-gray-500 text-sm">
            Invite friends and you&apos;ll both earn <strong>50 bonus credits</strong> when
            they sign up and use their first feature.
          </p>
        </div>
      </div>

      {/* Shareable Link */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Your Referral Link
          </h2>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={stats.referral_link}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 truncate"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Referral code: <span className="font-mono">{stats.referral_code}</span>
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            label="Friends Invited"
            value={stats.total_invited}
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-green-600" />}
            label="Completed"
            value={stats.total_completed}
          />
          <StatCard
            icon={<Coins className="w-5 h-5 text-amber-600" />}
            label="Credits Earned"
            value={stats.total_credits_earned}
          />
        </div>
      )}

      {/* Referral List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Your Referrals</h2>
        </div>
        {referrals.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <ExternalLink className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Friend</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Reward</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 text-gray-900">
                    {r.referred_name || r.referred_email || "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {r.referrer_rewarded ? "50 credits" : "Pending"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
      <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
