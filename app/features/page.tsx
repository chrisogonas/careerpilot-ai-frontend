"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import {
  FileText,
  Mic,
  ClipboardList,
  PenTool,
  Search,
  BarChart3,
  Bell,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    name: "AI Resume Tailoring",
    description:
      "Paste a job description and get an ATS-optimized resume rewritten to match the role — with targeted keywords, reformatted bullet points, and a match score.",
    href: "/features/resume-tailoring",
    badge: "Most Popular",
    highlights: ["ATS keyword optimization", "Match score", "Multiple base resumes"],
  },
  {
    icon: Mic,
    name: "AI Mock Interviews",
    description:
      "Practice with a realistic AI interviewer that asks role-specific questions, evaluates your answers in real time, and delivers a detailed scorecard.",
    href: "/features/mock-interviews",
    badge: "Pro & Premium",
    highlights: ["Text & voice modes", "Role-specific questions", "Detailed scorecard"],
  },
  {
    icon: ClipboardList,
    name: "Application Tracker",
    description:
      "Track every job application in one organized dashboard. See status at a glance, set follow-up reminders, and jump straight into AI tools for any application.",
    href: "/features/application-tracker",
    badge: "Free",
    highlights: ["Status pipeline", "Follow-up reminders", "One-click AI tools"],
  },
  {
    icon: PenTool,
    name: "Cover Letter Generator",
    description:
      "Generate a professional, job-specific cover letter in seconds. The AI matches your experience to the role and produces a polished, ready-to-send letter.",
    href: "/features/cover-letter",
    badge: null,
    highlights: ["Job-specific content", "Professional tone", "Fully editable"],
  },
  {
    icon: Search,
    name: "Job Board Search",
    description:
      "Search thousands of job listings across multiple boards from one interface. Filter by role, location, salary, and more — then import directly into your tracker.",
    href: "/features/job-board-search",
    badge: null,
    highlights: ["Multi-board search", "Advanced filters", "One-click import"],
  },
  {
    icon: BarChart3,
    name: "Analytics Dashboard",
    description:
      "Understand your job search with data. See application trends, response rates, credit usage, and identify patterns to optimize your strategy.",
    href: "/features/analytics",
    badge: null,
    highlights: ["Application trends", "Response rates", "Credit tracking"],
  },
  {
    icon: Bell,
    name: "Smart Reminders",
    description:
      "Never miss a follow-up. Set one-time or recurring reminders for applications, interviews, and deadlines — with in-app and email notifications.",
    href: "/features/smart-reminders",
    badge: null,
    highlights: ["Email notifications", "Recurring schedules", "Per-application reminders"],
  },
  {
    icon: Star,
    name: "STAR Story Builder",
    description:
      "Build a library of STAR-format stories from your experience. The AI helps structure your Situation, Task, Action, and Result for behavioral interview questions.",
    href: "/features/star-stories",
    badge: null,
    highlights: ["Guided STAR format", "Reusable story library", "Interview-ready answers"],
  },
];

export default function FeaturesOverview() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          ← Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
          Everything You Need to Land the Job
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          8 AI-powered tools designed to streamline every step of your job search
          — from resume to offer.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.name}
                    </h3>
                    {feature.badge && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <ul className="space-y-1">
                    {feature.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-1.5 text-sm text-gray-500"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Supercharge Your Job Search?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Start with 50 free credits — no credit card required.
          </p>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition shadow-md"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition shadow-md"
            >
              Get Started Free →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
