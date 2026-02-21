"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/utils/api";
import { UsageResponse } from "@/lib/types";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      fetchUsage();
    }
  }, [user, isAuthenticated, authLoading, router]);

  const fetchUsage = async () => {
    try {
      const response = await apiClient.getUsage();
      setUsage(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load usage data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "bg-amber-100 text-amber-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanLabel = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.full_name}!</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Plan and Credits Card */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Plan Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                Current Plan
              </h2>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPlanColor(usage.plan)}`}>
                {getPlanLabel(usage.plan)}
              </div>
              <p className="text-gray-600 text-sm mt-4">
                {usage.plan === "free"
                  ? "Upgrade to unlock more features"
                  : "Thanks for your subscription!"}
              </p>
            </div>

            {/* Credits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                Credits Remaining
              </h2>
              <p className="text-5xl font-bold text-blue-600">
                {usage.credits_remaining}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Use credits for AI-powered features
              </p>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-sm font-medium mb-2 opacity-90">
                Upgrade Your Plan
              </h2>
              <p className="text-sm opacity-75 mb-4">
                Get more features and credits
              </p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                View Plans
              </button>
            </div>
          </div>
        )}

        {/* Quotas */}
        {usage && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Monthly Quotas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <QuotaCard
                title="Resume Tailors"
                used={0}
                limit={usage.quotas.resume_tailors_per_month}
              />
              <QuotaCard
                title="Cover Letters"
                used={0}
                limit={usage.quotas.cover_letters_per_month}
              />
              <QuotaCard
                title="STAR Stories"
                used={0}
                limit={usage.quotas.star_stories_per_month}
              />
              <QuotaCard
                title="Job Analyses"
                used={0}
                limit={usage.quotas.job_analyses_per_month}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              title="Tailor Resume"
              description="Optimize your resume for a job description"
              href="/tailor"
              icon="📄"
            />
            <ActionCard
              title="Analyze Job"
              description="Extract requirements from job descriptions"
              href="/analyze-job"
              icon="🔍"
            />
            <ActionCard
              title="Generate Cover Letter"
              description="Create personalized cover letters"
              href="/cover-letter"
              icon="✍️"
            />
            <ActionCard
              title="STAR Stories"
              description="Generate interview preparation stories"
              href="/star-stories"
              icon="⭐"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotaCard({
  title,
  used,
  limit,
}: {
  title: string;
  used: number;
  limit: number;
}) {
  const percentage = (used / limit) * 100;

  return (
    <div className="p-4 background-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-gray-900">{used}</span>
        <span className="text-gray-500">/ {limit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  );
}
