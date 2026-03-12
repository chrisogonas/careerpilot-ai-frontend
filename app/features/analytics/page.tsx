"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function AnalyticsDashboardFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">📊</span>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Understand your job search with data. See application trends,
              response rates, credit usage, feature utilization, and identify patterns
              to optimize your strategy — all in clear, visual charts.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/analytics" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              View Analytics →
            </Link>
          ) : (
            <Link href="/auth/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start Free — Try It Now →
            </Link>
          )}
        </div>
      </div>

      {/* What You'll See */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">What You Can Track</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="📈" title="Application Pipeline" description="See how many applications are at each stage — saved, applied, interviewing, offered — and track your progress over time." />
            <StepCard number="💳" title="Credit Usage" description="Monitor how you're spending credits across features: resume tailoring, cover letters, mock interviews, STAR stories, and job searches." />
            <StepCard number="🎯" title="Feature Utilization" description="See which tools you're using most and discover features you haven't tried yet to get more value from your plan." />
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="Visual Overview" description="Clean charts and graphs show your job search progress at a glance — no manual tracking needed." />
            <Benefit title="Spot Patterns" description="See which application approaches are working best. Identify whether tailored resumes get more responses." />
            <Benefit title="Credit Planning" description="Track your credit balance and usage rate so you can plan when to purchase packs or upgrade your plan." />
            <Benefit title="Time-Based Trends" description="View your activity over different time periods to understand your search momentum and consistency." />
            <Benefit title="Exportable Insights" description="Use the data to adjust your strategy — focus more on what's working and try new approaches for what isn't." />
            <Benefit title="Available on All Plans" description="Basic analytics are available on all plans. Premium subscribers get advanced analytics with deeper breakdowns." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            Basic analytics are <strong>free on all plans</strong>.
            Premium subscribers get <strong>advanced analytics</strong> with deeper breakdowns and historical trends.
          </p>
          {!isAuthenticated && (
            <Link href="/auth/register" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Get Started Free →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <div className="text-3xl mb-3">{number}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Benefit({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <span className="text-blue-600 mt-0.5">✓</span>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
