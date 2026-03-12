"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function ResumesTailoringFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">📄</span>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI Resume Tailoring
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Stop sending the same generic resume to every job. Our AI analyzes the job description,
              identifies missing keywords and skills, and rewrites your resume with ATS-optimized formatting
              that matches exactly what recruiters are looking for.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/resumes" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Tailor a Resume →
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
            <StepCard number="1" title="Upload Resume" description="Upload your base resume or paste its text. CareerPilot stores it for reuse across multiple applications." />
            <StepCard number="2" title="Paste Job Description" description="Paste the full job description from any listing — or import it directly from Job Board Search." />
            <StepCard number="3" title="AI Analysis" description="Our AI compares your resume against the job requirements, identifying gaps in keywords, skills, and experience." />
            <StepCard number="4" title="Get Tailored Resume" description="Receive a rewritten resume with targeted bullet points, ATS-friendly keywords, and optimized formatting." />
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="ATS-Optimized Output" description="Resumes are formatted to pass Applicant Tracking Systems, with the right keywords placed strategically throughout." />
            <Benefit title="Job-Specific Tailoring" description="Every resume is customized to the specific role — not just generic rewording. The AI matches your experience to the job requirements." />
            <Benefit title="Multiple Resumes" description="Store up to 3 base resumes on Free (20 on Pro, unlimited on Premium) and tailor each for different roles or industries." />
            <Benefit title="Match Score" description="See a match percentage showing how well your resume aligns with the job description before and after tailoring." />
            <Benefit title="Fully Editable" description="Every AI-generated resume is fully editable. Tweak wording, reorder sections, or add your own touch before sending." />
            <Benefit title="Copy & Download" description="Copy the tailored resume text to clipboard or download it — ready to submit to any application." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            Resume tailoring costs <strong>5 credits</strong> per use. Job analysis (comparing your resume to a job description) costs <strong>1 credit</strong>.
            Available on <strong>all plans</strong> including Free.
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
