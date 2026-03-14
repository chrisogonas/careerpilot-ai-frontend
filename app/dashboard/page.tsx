"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/utils/api";
import { UsageResponse, EmailQuotaResponse, ActivityItem } from "@/lib/types";
import {
  FileText, Search, PenTool, Star, Briefcase, Mic,
  ArrowRight, AlertCircle, CreditCard, TrendingUp, Clock,
} from "lucide-react";
import type { ElementType } from "react";
import { DashboardSkeleton } from "@/app/components/Skeleton";
import ActivityTable from "@/app/components/ActivityTable";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [emailQuota, setEmailQuota] = useState<EmailQuotaResponse | null>(null);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
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
      const [usageRes, emailRes, activityRes] = await Promise.all([
        apiClient.getUsage(),
        apiClient.getEmailQuota(),
        apiClient.getRecentActivity(50).catch(() => ({ items: [], total: 0 })),
      ]);
      setUsage(usageRes);
      setEmailQuota(emailRes);
      setActivityItems(activityRes.items);
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
    return <DashboardSkeleton />;
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

        {/* Plan, Credits, Emails & Upgrade Cards */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Plan Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                Current Plan
              </h2>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPlanColor(usage.plan)}`}>
                {getPlanLabel(usage.plan)}
              </div>
              <p className="text-gray-600 text-sm mt-4">
                {usage.plan === "free" ? (
                  <Link href="/subscribe" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                    Upgrade to unlock more features
                  </Link>
                ) : (
                  "Thanks for your subscription!"
                )}
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
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((usage.credits_remaining / usage.monthly_credits) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                of {usage.monthly_credits} monthly credits
              </p>
            </div>

            {/* Email Reminders */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                Reminder Emails
              </h2>
              {emailQuota && emailQuota.email_reminder_limit > 0 ? (
                <>
                  <p className="text-5xl font-bold text-emerald-600">
                    {emailQuota.email_reminders_remaining}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        emailQuota.email_reminders_remaining / emailQuota.email_reminder_limit <= 0.15
                          ? "bg-red-500"
                          : emailQuota.email_reminders_remaining / emailQuota.email_reminder_limit <= 0.35
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (emailQuota.email_reminders_remaining / emailQuota.email_reminder_limit) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    of {emailQuota.email_reminder_limit} monthly emails
                    {emailQuota.email_reminders_used > 0 && (
                      <span className="text-gray-400">
                        {" "}· {emailQuota.email_reminders_used} used
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-300 mt-1">—</p>
                  <p className="text-gray-500 text-xs mt-4">
                    <Link href="/subscribe" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                      Upgrade to Pro
                    </Link>{" "}
                    to unlock email reminders
                  </p>
                </>
              )}
            </div>

            {/* Smart Upgrade CTA */}
            <UpgradeCTA
              plan={usage.plan}
              creditsRemaining={usage.credits_remaining}
              inGracePeriod={usage.in_grace_period}
              gracePeriodDaysRemaining={usage.grace_period_days_remaining}
              onNavigate={(path) => router.push(path)}
            />
          </div>
        )}

        {/* Usage This Month */}
        {usage && usage.usage_this_month && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Usage This Month
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Credits used: {
                Object.values(usage.usage_this_month).reduce((sum, op) => sum + op.credits_spent, 0)
              } of {usage.monthly_credits}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <UsageCard
                title="Resume Tailors"
                count={usage.usage_this_month.resume_tailors?.count ?? 0}
                creditsSpent={usage.usage_this_month.resume_tailors?.credits_spent ?? 0}
                costPer={usage.operation_costs?.resume_tailor ?? 5}
              />
              <UsageCard
                title="Cover Letters"
                count={usage.usage_this_month.cover_letters?.count ?? 0}
                creditsSpent={usage.usage_this_month.cover_letters?.credits_spent ?? 0}
                costPer={usage.operation_costs?.cover_letter ?? 2}
              />
              <UsageCard
                title="STAR Stories"
                count={usage.usage_this_month.star_stories?.count ?? 0}
                creditsSpent={usage.usage_this_month.star_stories?.credits_spent ?? 0}
                costPer={usage.operation_costs?.star_stories ?? 3}
              />
              <UsageCard
                title="Job Analyses"
                count={usage.usage_this_month.job_analyses?.count ?? 0}
                creditsSpent={usage.usage_this_month.job_analyses?.credits_spent ?? 0}
                costPer={usage.operation_costs?.job_analysis ?? 1}
              />
            </div>
          </div>
        )}

        {/* Suggested Next Steps — full width */}
        {usage && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Suggested Next Steps
            </h2>
            <SmartSuggestions usage={usage} />
          </div>
        )}

        {/* Recent Activity — full width */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <ActivityTable items={activityItems} />
        </div>
      </div>
    </div>
  );
}

function UsageCard({
  title,
  count,
  creditsSpent,
  costPer,
}: {
  title: string;
  count: number;
  creditsSpent: number;
  costPer: number;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold text-gray-900">{count}</span>
        <span className="text-gray-500 text-sm">uses</span>
      </div>
      <p className="text-sm text-gray-500">
        {creditsSpent} credit{creditsSpent !== 1 ? "s" : ""} spent
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {costPer} credit{costPer !== 1 ? "s" : ""} per use
      </p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition"
    >
      <div className="flex-shrink-0 text-blue-600">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 mt-0.5" />
    </Link>
  );
}

function SmartSuggestions({ usage }: { usage: UsageResponse }) {
  const u = usage.usage_this_month;

  const hasResumeTailors = (u.resume_tailors?.count ?? 0) > 0;
  const hasCoverLetters = (u.cover_letters?.count ?? 0) > 0;
  const hasJobAnalyses = (u.job_analyses?.count ?? 0) > 0;
  const hasStarStories = (u.star_stories?.count ?? 0) > 0;

  // Priority-scored suggestions — higher = more relevant to the user right now
  const scored: { title: string; description: string; href: string; icon: ElementType; priority: number }[] = [];

  // Urgent: low credits always surfaces
  if (usage.credits_remaining < 10 && usage.plan !== "premium") {
    scored.push({
      title: "Running low on credits",
      description: `Only ${usage.credits_remaining} credits left — upgrade or buy a pack`,
      href: "/subscribe",
      icon: AlertCircle,
      priority: 100,
    });
  }

  // --- Workflow-stage scoring ---
  // Brand-new user: guide them into the funnel
  if (!hasJobAnalyses && !hasResumeTailors) {
    scored.push({
      title: "Analyze a job description",
      description: "Paste a job listing to extract key requirements",
      href: "/analyze-job",
      icon: Search,
      priority: 90,
    });
  }

  if (!hasResumeTailors) {
    // Highest non-urgent action for users who haven't tailored yet
    scored.push({
      title: "Tailor your resume",
      description: "Optimize your resume for a specific job description",
      href: "/tailor",
      icon: FileText,
      priority: hasJobAnalyses ? 85 : 80, // boost if they already analyzed a job
    });
  }

  // Natural next step after tailoring a resume
  if (hasResumeTailors && !hasCoverLetters) {
    scored.push({
      title: "Generate a cover letter",
      description: "Complete your application with a matching cover letter",
      href: "/cover-letter",
      icon: PenTool,
      priority: 75,
    });
  }

  // Interview prep — higher priority once they have materials ready
  if (!hasStarStories) {
    scored.push({
      title: "Prepare STAR stories",
      description: "Generate behavioral interview stories from your experience",
      href: "/star-stories",
      icon: Star,
      priority: hasResumeTailors ? 70 : 50,
    });
  }

  // Application tracking — only relevant once they've done real prep
  if (hasResumeTailors && hasJobAnalyses) {
    scored.push({
      title: "Track an application",
      description: "Keep your job applications organized in one place",
      href: "/applications/new",
      icon: Briefcase,
      priority: 65,
    });
  }

  // Mock interview — meaningful once resume work is done
  if (hasResumeTailors) {
    scored.push({
      title: "Practice a mock interview",
      description: "Get AI feedback on your interview responses",
      href: "/mock-interview",
      icon: Mic,
      priority: hasStarStories ? 60 : 45, // boost if they already have STAR stories
    });
  }

  // Job search — always available, moderate priority
  scored.push({
    title: "Search for jobs",
    description: "Browse openings across major job boards",
    href: "/jobs/search",
    icon: Search,
    priority: hasResumeTailors ? 40 : 55, // higher for new users who need leads
  });

  // Sort by priority descending and pick top 3
  scored.sort((a, b) => b.priority - a.priority);
  const displayed = scored.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {displayed.map((s) => (
        <ActionCard key={s.href} {...s} />
      ))}
    </div>
  );
}

function UpgradeCTA({
  plan,
  creditsRemaining,
  inGracePeriod,
  gracePeriodDaysRemaining,
  onNavigate,
}: {
  plan: string;
  creditsRemaining: number;
  inGracePeriod: boolean;
  gracePeriodDaysRemaining: number | null;
  onNavigate: (path: string) => void;
}) {
  // Grace period — urgent renewal
  if (inGracePeriod) {
    const daysLeft = gracePeriodDaysRemaining ?? 0;
    return (
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 opacity-90" />
          <h2 className="text-sm font-medium opacity-90">Subscription Expired</h2>
        </div>
        <p className="text-sm opacity-80 mb-1">
          {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in grace period` : "Grace period ending soon"}
        </p>
        <p className="text-xs opacity-65 mb-4">Renew now to keep your Pro/Premium features</p>
        <button onClick={() => onNavigate("/subscribe")} className="w-full bg-white text-red-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          Renew Now
        </button>
      </div>
    );
  }

  // Free → Pro
  if (plan === "free") {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 opacity-90" />
          <h2 className="text-sm font-medium opacity-90">Upgrade to Pro</h2>
        </div>
        <ul className="text-sm opacity-80 space-y-1 mb-4">
          <li>200 credits/month</li>
          <li>Email reminders</li>
          <li>Mock interviews</li>
        </ul>
        <button onClick={() => onNavigate("/subscribe")} className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          View Plans
        </button>
      </div>
    );
  }

  // Pro → Premium
  if (plan === "pro") {
    return (
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 opacity-90" />
          <h2 className="text-sm font-medium opacity-90">Upgrade to Premium</h2>
        </div>
        <ul className="text-sm opacity-80 space-y-1 mb-4">
          <li>Unlimited credits</li>
          <li>Priority AI processing</li>
          <li>Advanced analytics</li>
        </ul>
        <button onClick={() => onNavigate("/subscribe")} className="w-full bg-white text-amber-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          View Plans
        </button>
      </div>
    );
  }

  // Premium with low credits → buy credit pack
  if (plan === "premium" && creditsRemaining < 20) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 opacity-90" />
          <h2 className="text-sm font-medium opacity-90">Need More Credits?</h2>
        </div>
        <p className="text-sm opacity-80 mb-4">
          {creditsRemaining} credits remaining — top up with a credit pack
        </p>
        <button onClick={() => onNavigate("/subscribe")} className="w-full bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          Buy Credits
        </button>
      </div>
    );
  }

  // Premium with plenty of credits — nothing to show
  return null;
}
