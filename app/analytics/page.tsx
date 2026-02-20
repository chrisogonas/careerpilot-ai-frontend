"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { UserAnalytics } from "@/lib/types";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, getAnalytics, isLoading, error } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const loadAnalytics = async () => {
      try {
        setLocalError(null);
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load analytics";
        setLocalError(message);
      }
    };

    loadAnalytics();
  }, [isAuthenticated, router, getAnalytics]);

  if (isLoading && !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-slate-600">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {localError || error || "Failed to load analytics"}
          </div>
          <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const metrics = analytics.metrics;
  const resumeUsage = analytics.resume_usage;
  const followUpStats = analytics.follow_up_stats;
  const trends = analytics.trends;
  const marketInsights = analytics.market_insights;

  // Calculate additional metrics
  const applicationConversionRate = metrics.total_applications > 0 
    ? ((metrics.total_by_status["offer"] || 0) / metrics.total_applications * 100).toFixed(1)
    : 0;

  const rejectionRateNum = metrics.total_applications > 0
    ? (metrics.total_by_status["rejected"] || 0) / metrics.total_applications * 100
    : 0;

  const rejectionRate = rejectionRateNum.toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Search Analytics</h1>
          <p className="text-slate-600">Insights into your job application journey</p>
          {analytics.generated_at && (
            <p className="text-xs text-slate-500 mt-2">
              Last updated: {new Date(analytics.generated_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Error Messages */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {localError || error}
          </div>
        )}

        {/* Main Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Applications */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.total_applications}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{metrics.success_rate.toFixed(1)}%</p>
              </div>
              <div className="text-4xl">✨</div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Offer Rate</p>
                <p className="text-3xl font-bold text-blue-600">{applicationConversionRate}%</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          {/* Avg Days to Decision */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Avg Days to Decision</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.average_days_to_decision}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Application Status Breakdown</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(metrics.total_by_status).map(([status, count]) => {
              const statusLabels: Record<string, string> = {
                saved: "Saved",
                applied: "Applied",
                phone_screen: "Phone Screen",
                interview: "Interview",
                final_round: "Final Round",
                offer: "Offer",
                accepted: "Accepted",
                rejected: "Rejected",
                withdrawn: "Withdrawn",
              };

              const statusColors: Record<string, string> = {
                saved: "bg-slate-100 text-slate-700",
                applied: "bg-blue-100 text-blue-700",
                phone_screen: "bg-cyan-100 text-cyan-700",
                interview: "bg-amber-100 text-amber-700",
                final_round: "bg-orange-100 text-orange-700",
                offer: "bg-green-100 text-green-700",
                accepted: "bg-emerald-100 text-emerald-700",
                rejected: "bg-red-100 text-red-700",
                withdrawn: "bg-gray-100 text-gray-700",
              };

              return (
                <div key={status} className={`rounded-lg p-4 text-center ${statusColors[status]}`}>
                  <p className="text-sm font-semibold mb-2">{statusLabels[status]}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          {/* Job Market Insights */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Job Market Insights</h2>

            {/* Salary Statistics */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Salary Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Minimum</span>
                  <span className="font-bold text-slate-900">${marketInsights.salary_statistics.min.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Average</span>
                  <span className="font-bold text-blue-600">${marketInsights.salary_statistics.average.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Median</span>
                  <span className="font-bold text-slate-900">${marketInsights.salary_statistics.median.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Maximum</span>
                  <span className="font-bold text-green-600">${marketInsights.salary_statistics.max.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Top Companies */}
            {marketInsights.top_companies.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Top Companies</h3>
                <div className="space-y-2">
                  {marketInsights.top_companies.slice(0, 5).map((company, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">{company.company_name}</p>
                        <p className="text-xs text-slate-600">{company.application_count} applications</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">{(company.success_rate * 100).toFixed(0)}% success</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume & Follow-up Statistics */}
          <div className="space-y-8">
            {/* Resume Usage */}
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Resume Usage</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Resumes</span>
                  <span className="font-bold text-slate-900">{resumeUsage.total_resumes}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Resumes Used</span>
                  <span className="font-bold text-blue-600">{resumeUsage.resumes_used}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Tailors</span>
                  <span className="font-bold text-slate-900">{resumeUsage.total_tailors}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Avg Tailors/Resume</span>
                  <span className="font-bold text-amber-600">{resumeUsage.average_tailors_per_resume.toFixed(1)}</span>
                </div>
                {resumeUsage.most_used_resume && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">Most Used Read</p>
                    <p className="font-bold text-slate-900">{resumeUsage.most_used_resume.title}</p>
                    <p className="text-xs text-blue-700">{resumeUsage.most_used_resume.tailor_count} tailors</p>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up Statistics */}
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Follow-up Activity</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Follow-ups</span>
                  <span className="font-bold text-slate-900">{followUpStats.total_follow_ups}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Pending Follow-ups</span>
                  <span className="font-bold text-amber-600">{followUpStats.pending_follow_ups}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Avg per Application</span>
                  <span className="font-bold text-blue-600">{followUpStats.average_follow_ups_per_application.toFixed(1)}</span>
                </div>
                {Object.entries(followUpStats.follow_ups_by_type).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Follow-up Types</p>
                    <div className="space-y-2">
                      {Object.entries(followUpStats.follow_ups_by_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 capitalize">{type.replace(/_/g, " ")}</span>
                          <span className="font-semibold text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Market Distribution */}
        {Object.keys(marketInsights.job_types_distribution).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Job Type Distribution</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(marketInsights.job_types_distribution).map(([type, count]) => (
                <div key={type} className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-slate-900">{count}</p>
                  <p className="text-sm text-slate-600 capitalize">{type.replace(/-/g, " ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Locations */}
        {marketInsights.top_locations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Job Locations</h2>
            <div className="space-y-3">
              {marketInsights.top_locations.slice(0, 5).map((location, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{location.location}</p>
                    <p className="text-xs text-slate-600">{location.application_count} applications</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${location.average_salary.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">avg salary</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends & Growth */}
        {metrics.total_applications > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Job Search Growth</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Month-over-Month Growth</p>
                <p className={`text-3xl font-bold ${trends.month_over_month_growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {trends.month_over_month_growth >= 0 ? "+" : ""}{trends.month_over_month_growth.toFixed(1)}%
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Weekly Average</p>
                <p className="text-3xl font-bold text-blue-600">{trends.weekly_average_applications.toFixed(1)}</p>
                <p className="text-xs text-slate-600">applications/week</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Rejection Rate</p>
                <p className={`text-3xl font-bold ${rejectionRateNum > 50 ? "text-red-600" : "text-amber-600"}`}>
                  {rejectionRate}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Analytics Tips</h3>
          <ul className="space-y-3 text-blue-900">
            <li className="flex gap-3">
              <span className="font-bold">📊</span>
              <span>Monitor your success rate to identify what's working in your job search</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">📝</span>
              <span>Track which resumes and tailoring approaches generate the most offers</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">📞</span>
              <span>Follow-up consistently - applications with follow-ups have higher success rates</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">🎯</span>
              <span>Focus on companies and locations where your success rate is highest</span>
            </li>
          </ul>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/applications"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            View Applications
          </Link>
          <Link
            href="/resumes"
            className="px-6 py-3 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition"
          >
            View Resumes
          </Link>
        </div>
      </div>
    </div>
  );
}
