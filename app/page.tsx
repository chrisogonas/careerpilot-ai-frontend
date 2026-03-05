"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            ✨ AI-Powered Career Platform — from search to offer
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Career Advancement
            </span>{" "}
            Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Search jobs across Indeed, LinkedIn &amp; Glassdoor. Tailor your resume,
            generate cover letters, practice with AI mock interviews, and track
            every application — all in one place.
          </p>

          {!isAuthenticated ? (
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
              >
                Start Free — 60 Credits →
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
            >
              Go to Dashboard →
            </Link>
          )}

          {/* Trust bar */}
          <p className="mt-6 text-sm text-gray-400">
            No credit card required &bull; 60 free monthly credits &bull; Cancel anytime
          </p>
        </div>

        {/* Features */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔍"
            title="Job Board Search"
            description="Search Indeed, LinkedIn, Glassdoor & more from one place. Save searches and add jobs straight to your tracker."
            badge="New"
          />
          <FeatureCard
            icon="📄"
            title="AI Resume Tailoring"
            description="Paste a job description and get your resume rewritten with the right keywords, skills & ATS-friendly formatting."
          />
          <FeatureCard
            icon="✍️"
            title="Cover Letter Generator"
            description="Personalized cover letters crafted for each company and role — matching your tone and experience."
          />
          <FeatureCard
            icon="🎙️"
            title="AI Mock Interviews"
            description="Practice with an AI interviewer via text or voice. Get real-time feedback, scores & detailed improvement tips."
            badge="New"
          />
          <FeatureCard
            icon="⭐"
            title="STAR Story Builder"
            description="Generate polished behavioral interview stories from your experience using the STAR method."
          />
          <FeatureCard
            icon="📋"
            title="Application Tracker"
            description="Track every job application in one dashboard — status, notes, deadlines & quick access to tailor or prep."
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            From finding the right job to acing the interview — CareerPilot covers every step
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Step
              number="1"
              title="Find Jobs"
              description="Search across major job boards or paste a job URL to get started instantly"
            />
            <Step
              number="2"
              title="Tailor & Apply"
              description="AI rewrites your resume & cover letter to match each job description perfectly"
            />
            <Step
              number="3"
              title="Prepare"
              description="Practice with AI mock interviews and build STAR stories for behavioral questions"
            />
            <Step
              number="4"
              title="Track & Land It"
              description="Track all your applications in one place and stay on top of every opportunity"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Simple Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              name="Free"
              price="$0"
              features={[
                "60 monthly credits",
                "3 resumes",
                "Resume tailoring",
                "Job analysis",
                "STAR story generation",
                "5 free job searches",
                "Application tracker",
                "Community support",
              ]}
              ctaLink="/auth/register"
            />
            <PricingCard
              name="Pro"
              price="$9.99"
              features={[
                "500 monthly credits",
                "20 resumes",
                "Advanced resume tailoring",
                "Cover letter generation",
                "AI mock interviews",
                "Unlimited job board search",
                "STAR story generation",
                "Application tracker",
                "Priority support",
              ]}
              highlighted
              ctaLink="/subscribe"
            />
            <PricingCard
              name="Premium"
              price="$29.99"
              features={[
                "2,000 monthly credits",
                "Unlimited resumes",
                "Unlimited resume tailoring",
                "Cover letter generation",
                "AI mock interviews",
                "Unlimited job board search",
                "STAR story generation",
                "Advanced analytics",
                "Application tracker",
                "Dedicated support",
              ]}
              ctaLink="/subscribe"
            />
          </div>

          {/* Pay As You Go Credit Packs */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Or Buy Credits As You Go
            </h3>
            <p className="text-center text-gray-600 mb-10 text-lg">
              Need extra credits? Purchase one-time credit packs — valid for 60 days.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <CreditPackCard
                credits={200}
                price="$4.99"
                perCredit="$0.025"
              />
              <CreditPackCard
                credits={400}
                price="$11.99"
                perCredit="$0.030"
                bestValue
              />
              <CreditPackCard
                credits={700}
                price="$19.99"
                perCredit="$0.029"
              />
            </div>
            <p className="text-center text-gray-500 mt-6 text-sm">
              Purchased credits are valid for 60 days and work with any plan.{" "}
              <Link href="/subscribe" className="text-blue-600 hover:underline">
                Buy credits →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="How does AI resume tailoring work?"
              answer="Our AI analyzes job descriptions and compares them with your resume. It identifies missing keywords, skills, and experience that match what recruiters are looking for, then rewrites your resume with ATS-friendly formatting and targeted bullet points."
            />
            <FAQItem
              question="How does the Job Board Search work?"
              answer="CareerPilot searches across Indeed, LinkedIn, Glassdoor and other major job boards simultaneously using the JSearch API. You can filter by date, employment type, remote status, and location. Save searches for later, save jobs to your application tracker, or jump straight into tailoring your resume for a specific listing."
            />
            <FAQItem
              question="What are AI Mock Interviews?"
              answer="Our AI interviewer conducts realistic mock interviews based on the job you're targeting. Choose text or voice mode — the AI asks tailored questions, evaluates your answers in real time, and provides a detailed scorecard with feedback on content, communication, and areas to improve."
            />
            <FAQItem
              question="Will my resume work with Applicant Tracking Systems (ATS)?"
              answer="Yes! Our resume optimization ensures your resume passes ATS filters. We analyze your resume against the job description to maximize match rate and ensure it's formatted correctly."
            />
            <FAQItem
              question="Can I customize the AI-generated content?"
              answer="Absolutely. All AI-generated content (resumes, cover letters, STAR stories) is fully editable. You can customize everything to match your voice and specific experience."
            />
            <FAQItem
              question="How do credits work?"
              answer="Credits are the currency for AI-powered features. Job analysis costs 1 credit, resume tailoring costs 5 credits, cover letter generation costs 2 credits, STAR story generation costs 3 credits, mock interviews cost 5 credits, and job searches cost 1 credit. Free plan users get 60 monthly credits; paid plans get their respective allotment plus any purchased credit packs."
            />
            <FAQItem
              question="What can I do on the Free plan?"
              answer="The Free plan includes 60 monthly credits, up to 3 resumes, resume tailoring, job analysis, STAR story generation, 5 free job searches, and the application tracker. It's perfect for testing the platform. Note: cover letter generation and AI mock interviews require a Pro or Premium subscription."
            />
            <FAQItem
              question="Which features require a paid subscription?"
              answer="Cover letter generation and AI mock interviews are exclusive to Pro and Premium subscribers. All other features — resume tailoring, job analysis, STAR story generation, job board search, and the application tracker — are available on every plan including Free, as long as you have credits."
            />
            <FAQItem
              question="What are credit packs?"
              answer="Credit packs are one-time purchases (200, 400, or 700 credits) that add credits to your account instantly. Purchased credits are valid for 60 days and work alongside any subscription plan. If you buy another pack before your credits expire, the expiry window is extended."
            />
            <FAQItem
              question="Do you offer annual billing?"
              answer="Yes! Both Pro and Premium plans offer annual billing with a 20% discount. Pro annual is $7.99/month (billed $95.88/year) and Premium annual is $23.99/month (billed $287.88/year). You can switch between monthly and annual billing anytime."
            />
            <FAQItem
              question="Can I cancel or change my plan anytime?"
              answer="Absolutely. You can upgrade, downgrade, or cancel your plan at any time with no contracts or cancellation fees. Your access continues until the end of your current billing period."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. We use industry-standard encryption and security practices including two-factor authentication (2FA) to protect your resume and personal information. Your data is never shared with third parties."
            />
          </div>
        </div>
      </div>

      {/* Blog & Resources Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Career Resources & Blog
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Learn job search strategies, resume tips, and interview preparation techniques from our experts
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ResourceCard
              icon="📚"
              title="Resume Best Practices"
              description="Learn how to structure your resume, optimize for ATS systems, and highlight your achievements effectively."
              link="#"
            />
            <ResourceCard
              icon="💼"
              title="Job Search Strategies"
              description="Discover proven techniques to find the right jobs, customize applications, and stand out to recruiters."
              link="#"
            />
            <ResourceCard
              icon="🎤"
              title="Interview Preparation"
              description="Master the STAR method, prepare behavioral stories, and boost your confidence before the big day."
              link="#"
            />
            <ResourceCard
              icon="🔍"
              title="Beating ATS Systems"
              description="Understand how Applicant Tracking Systems work and learn strategies to get your resume past the filters."
              link="#"
            />
            <ResourceCard
              icon="✍️"
              title="Cover Letter Guides"
              description="Write compelling cover letters that grab attention and complement your resume perfectly."
              link="#"
            />
            <ResourceCard
              icon="🎯"
              title="Career Development"
              description="Advance your career with tips on skill development, networking, and career transitions."
              link="#"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to advance your career?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Search jobs, tailor your resume, prep for interviews, and track it all — powered by AI
          </p>
          {!isAuthenticated && (
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Get Started Free — No Credit Card →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {badge && (
        <span className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  features: string[];
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-8 ${
        highlighted
          ? "bg-blue-600 text-white shadow-xl scale-105"
          : "bg-white border border-gray-200"
      }`}
    >
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? "text-white" : "text-gray-900"}`}>
        {name}
      </h3>
      <div className={`text-4xl font-bold mb-6 ${highlighted ? "text-white" : "text-gray-900"}`}>
        {price}
        <span className="text-lg font-normal">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className={`flex items-center ${highlighted ? "text-blue-100" : "text-gray-600"}`}>
            <span className="mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block w-full py-2 rounded-lg font-semibold text-center transition ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-gray-100"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <h3 className="text-lg font-semibold text-gray-900 text-left">{question}</h3>
        <span className={`text-2xl text-blue-600 transition transform ${isOpen ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function ResourceCard({
  icon,
  title,
  description,
  link,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:border-blue-600 border border-gray-200 transition"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition">
        Learn more →
      </span>
    </Link>
  );
}

function CreditPackCard({
  credits,
  price,
  perCredit,
  bestValue = false,
}: {
  credits: number;
  price: string;
  perCredit: string;
  bestValue?: boolean;
}) {
  return (
    <div className={`relative bg-white rounded-lg p-6 border-2 ${bestValue ? "border-green-500 shadow-lg" : "border-gray-200"}`}>
      {bestValue && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Best Value
        </span>
      )}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">{credits.toLocaleString()}</div>
        <div className="text-gray-500 mb-4">credits</div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{price}</div>
        <div className="text-sm text-gray-500 mb-4">{perCredit}/credit</div>
        <div className="text-xs text-amber-600 font-semibold">Valid for 60 days</div>
      </div>
    </div>
  );
}
