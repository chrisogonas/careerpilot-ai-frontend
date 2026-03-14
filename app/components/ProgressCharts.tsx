"use client";

import { useEffect, useState } from "react";
import { ProgressSummary } from "@/lib/types";
import { apiClient } from "@/lib/utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  saved: "#94a3b8",
  applied: "#3b82f6",
  phone_screen: "#06b6d4",
  interview: "#f59e0b",
  final_round: "#f97316",
  offer: "#22c55e",
  accepted: "#10b981",
  rejected: "#ef4444",
  withdrawn: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
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

const ACTIVITY_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e", "#ef4444", "#ec4899", "#f97316"];

const ACTIVITY_LABELS: Record<string, string> = {
  resume_tailor: "Resume Tailor",
  job_analysis: "Job Analysis",
  cover_letter: "Cover Letter",
  star_stories: "STAR Stories",
  mock_interview: "Mock Interview",
  job_search: "Job Search",
};

export default function ProgressCharts() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getProgressSummary(12);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow border border-slate-200 p-6 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-48 mb-6" />
            <div className="h-48 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
        {error || "No progress data available yet."}
      </div>
    );
  }

  const hasWeekly = data.weekly_applications.length > 0;
  const hasFunnel = data.pipeline_funnel.length > 0;
  const hasActivity = data.activity_breakdown.length > 0;
  const hasInterviews = data.interview_scores.length > 0;

  // Format weekly data for chart
  const weeklyData = data.weekly_applications.map((w) => ({
    week: new Date(w.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: w.count,
  }));

  // Format funnel with labels and colors
  const funnelData = data.pipeline_funnel.map((f) => ({
    name: STATUS_LABELS[f.status] || f.status,
    count: f.count,
    fill: STATUS_COLORS[f.status] || "#94a3b8",
  }));

  // Format activity data
  const activityData = data.activity_breakdown.map((a) => ({
    name: ACTIVITY_LABELS[a.type] || a.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: a.count,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Weekly Applications Bar Chart */}
        {hasWeekly && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Applications</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pipeline Funnel Bar Chart */}
        {hasFunnel && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Application Pipeline</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" width={100} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Activity Breakdown Pie Chart */}
        {hasActivity && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {activityData.map((_, idx) => (
                    <Cell key={idx} fill={ACTIVITY_COLORS[idx % ACTIVITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Interview Score Trend */}
        {hasInterviews && (
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Interview Score Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.interview_scores} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                  formatter={(value) => [`${value}/100`, "Score"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  name="Interview Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Empty state if no charts */}
      {!hasWeekly && !hasFunnel && !hasActivity && !hasInterviews && (
        <div className="bg-white rounded-lg shadow border border-slate-200 p-8 text-center">
          <p className="text-slate-500 text-lg mb-2">No progress data yet</p>
          <p className="text-slate-400 text-sm">Start applying to jobs, tailoring resumes, and practicing interviews to see your progress charts here.</p>
        </div>
      )}
    </div>
  );
}
