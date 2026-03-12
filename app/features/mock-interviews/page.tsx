"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function MockInterviewFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">🎙️</span>
          <div>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">New</span>
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 ml-1">Pro &amp; Premium</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI Mock Interviews
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Practice with a realistic AI interviewer that asks role-specific questions,
              evaluates your answers in real time, and delivers a detailed scorecard with
              actionable feedback — via text or voice.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/mock-interview" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start a Mock Interview →
            </Link>
          ) : (
            <Link href="/auth/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start Free — Upgrade to Pro →
            </Link>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard number="1" title="Choose Your Role" description="Select the job title and paste the job description so the AI can tailor questions to the specific role." />
            <StepCard number="2" title="Pick Your Mode" description="Choose text-based or voice-based interviewing. Voice mode uses your microphone and plays back AI responses." />
            <StepCard number="3" title="Answer Questions" description="The AI asks realistic interview questions — behavioral, technical, and situational — one at a time." />
            <StepCard number="4" title="Get Your Scorecard" description="Receive a detailed scorecard with scores for each answer, overall performance, and specific improvement tips." />
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="Role-Specific Questions" description="Questions are tailored to the exact job description — not generic interview prep. The AI adapts to industry, seniority level, and role type." />
            <Benefit title="Text & Voice Modes" description="Practice typing responses for text-based applications, or use voice mode for a realistic phone/video interview simulation." />
            <Benefit title="Real-Time Evaluation" description="Each answer is evaluated on content quality, communication clarity, relevance, and use of concrete examples." />
            <Benefit title="Detailed Scorecard" description="Get an overall score plus per-question breakdowns with specific feedback on what you did well and what to improve." />
            <Benefit title="Unlimited Practice" description="Run as many mock interviews as you have credits for. Each session gives you targeted areas to work on before the next." />
            <Benefit title="Builds Confidence" description="Practicing with realistic questions and getting constructive feedback reduces anxiety and sharpens your delivery for the real thing." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            Each mock interview session costs <strong>5 credits</strong>.
            This feature requires a <strong>Pro or Premium subscription</strong>.
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
