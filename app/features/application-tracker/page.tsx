"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function ApplicationTrackerFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">📋</span>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Application Tracker
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Track every job application in one organized dashboard. See status at a glance,
              add notes and deadlines, set follow-up reminders, and jump straight into resume
              tailoring or interview prep for any application.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/applications" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              View My Applications →
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard number="1" title="Add Applications" description="Add jobs manually or import them directly from Job Board Search. Title, company, description, and salary auto-fill." />
            <StepCard number="2" title="Track Status" description="Move applications through stages: Saved → Applied → Phone Screen → Interview → Offer → Accepted/Rejected." />
            <StepCard number="3" title="Set Reminders" description="Add follow-up reminders for each application. Get notified when it's time to follow up or prepare." />
            <StepCard number="4" title="Take Action" description="From any application, jump to resume tailoring, cover letter generation, or mock interview prep with one click." />
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="All Applications in One Place" description="No more spreadsheets or scattered notes. Every application, status update, and deadline is in one dashboard." />
            <Benefit title="Status Pipeline" description="Visual status tracking from initial interest through offer. See your entire pipeline at a glance." />
            <Benefit title="One-Click AI Tools" description="From any application, jump directly to resume tailoring, cover letter generation, or mock interview — the job context pre-fills automatically." />
            <Benefit title="Follow-Up Reminders" description="Set one-time or recurring reminders for follow-ups. Get notified via in-app banner and optional email." />
            <Benefit title="Notes & Tags" description="Add private notes, custom tags, salary range, job type, and location to keep everything organized." />
            <Benefit title="Import From Search" description="Found a job in our Job Board Search? One click imports it into your tracker with all details pre-filled." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            The Application Tracker is <strong>free on all plans</strong>. Track unlimited applications,
            set reminders, and organize your entire job search at no cost.
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
