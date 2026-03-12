"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function SmartRemindersFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">🔔</span>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Smart Reminders
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Never miss a follow-up or deadline. Set one-time or recurring reminders
              for applications, todos, and tasks. Get notified via in-app alerts with
              a gentle chime, or opt-in to email notifications for important deadlines.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/todos" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Manage Reminders →
            </Link>
          ) : (
            <Link href="/auth/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start Free — Try It Now →
            </Link>
          )}
        </div>
      </div>

      {/* Types of Reminders */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Two Types of Reminders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Follow-Up Reminders</h3>
              <p className="text-gray-600 mb-3">Attached to specific job applications. Set a reminder to follow up after an interview, check on a pending application, or prepare for an upcoming meeting.</p>
              <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">Pro &amp; Premium</span>
            </div>
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Todo Reminders</h3>
              <p className="text-gray-600 mb-3">General-purpose reminders for your job search tasks. Update your resume, research a company, practice interview questions — with optional due dates and recurring schedules.</p>
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">All Plans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="In-App Notifications" description="A gentle chime and animated banner alerts you when a reminder is due. Reminders cycle and auto-park to a notification bell for later." />
            <Benefit title="Snooze & Dismiss" description="Not ready? Snooze for 5 minutes, 1 hour, 1 day, or up to 1 week. Or dismiss to clear it and mark as handled." />
            <Benefit title="Recurring Schedules" description="Set reminders to repeat daily, weekly, biweekly, or monthly. Perfect for weekly check-ins or regular follow-up cadences." />
            <Benefit title="Email Notifications" description="Opt-in to receive email reminders for critical deadlines. Never miss an important follow-up even when you're away from the app." />
            <Benefit title="Notification Tray" description="Dismissed or auto-parked reminders live in a bell icon tray. Click to view all parked notifications and take action." />
            <Benefit title="Todo Management" description="Create, prioritize, and track job search tasks with due dates, status tracking (pending, in-progress, completed), and reminder integration." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            Todo reminders are <strong>free on all plans</strong>.
            Follow-up reminders (attached to applications) require a <strong>Pro or Premium subscription</strong>.
            Email reminders are available with limits: <strong>100/month on Pro, 200/month on Premium</strong>.
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
