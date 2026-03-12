"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function CoverLetterFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">✍️</span>
          <div>
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">Pro &amp; Premium</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cover Letter Generator
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Generate personalized, professional cover letters tailored to each company and role.
              Our AI matches your experience and tone to the job requirements, producing a polished
              letter that complements your resume perfectly.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/cover-letter" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Generate a Cover Letter →
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="1" title="Provide Context" description="Select your resume and paste the job description. The AI already knows your experience from your uploaded resume." />
            <StepCard number="2" title="AI Generates" description="Our AI crafts a tailored cover letter that highlights relevant experience, demonstrates company knowledge, and matches the role requirements." />
            <StepCard number="3" title="Edit & Send" description="Review the generated letter, make any personal tweaks, then copy or download it — ready to submit alongside your resume." />
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="Personalized, Not Generic" description="Each letter is custom-written for the specific company and role — not a template with placeholder fields." />
            <Benefit title="Complements Your Resume" description="The AI reads both your resume and the job description, ensuring the cover letter adds new context rather than repeating bullet points." />
            <Benefit title="Professional Tone" description="Polished, confident writing that matches industry expectations — formal for corporate roles, conversational for startups." />
            <Benefit title="Instant Generation" description="Get a complete, ready-to-send cover letter in seconds rather than spending 30+ minutes writing from scratch." />
            <Benefit title="Fully Editable" description="Every generated letter is fully editable. Add personal anecdotes, adjust tone, or customize the opening paragraph." />
            <Benefit title="Works With Any Job" description="Whether you found the job through our Job Board Search or externally, just paste the description and go." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            Cover letter generation costs <strong>2 credits</strong> per use.
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
