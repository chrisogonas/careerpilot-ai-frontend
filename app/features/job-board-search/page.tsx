"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function JobBoardSearchFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">🔍</span>
          <div>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">New</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Job Board Search
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Search Indeed, LinkedIn, Glassdoor, ZipRecruiter, and 20+ other job boards from
              one unified dashboard. No more toggling between tabs — find every opportunity in one place.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/jobs/search" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Search Jobs Now →
            </Link>
          ) : (
            <Link href="/auth/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start Free — Try It Now →
            </Link>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="1" title="Search" description="Enter keywords, location, and filters like remote, full-time, or date posted. CareerPilot queries 20+ job boards simultaneously." />
            <StepCard number="2" title="Browse & Save" description="Review rich result cards with salary, company info, and source. Save promising searches for quick re-runs later." />
            <StepCard number="3" title="Import & Apply" description="Add any job to your Application Tracker with one click, then jump straight into resume tailoring or cover letter generation." />
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="20+ Job Boards, One Search" description="Indeed, LinkedIn, Glassdoor, ZipRecruiter, and more — all searched at once so you never miss an opportunity." />
            <Benefit title="Smart Filters" description="Narrow results by date posted, employment type (full-time, part-time, contract), remote status, and location." />
            <Benefit title="Saved Searches" description="Save your favorite search criteria with auto-generated descriptive names. Re-run any saved search with one click." />
            <Benefit title="One-Click Import" description="Found a great job? Import it directly into your Application Tracker — job title, company, description, and salary all pre-filled." />
            <Benefit title="Server-Side Caching" description="Results are cached for 6 hours, so repeated searches are instant and don't cost additional credits." />
            <Benefit title="Seamless AI Pipeline" description="After importing a job, use that listing's data for resume tailoring, cover letter generation, and mock interview preparation." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            Free plan users get <strong>5 free searches per 30-day window</strong>.
            Pro and Premium subscribers get <strong>unlimited searches</strong> at 1 credit per search
            (cached results are free).
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
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-3">{number}</div>
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
