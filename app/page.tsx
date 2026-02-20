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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Career Advancement
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get your resume tailored, cover letters written, and interview stories
            prepared—all with AI. Land more interviews in less time.
          </p>

          {!isAuthenticated ? (
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Free →
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
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard →
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon="📄"
            title="Resume Tailoring"
            description="AI-optimized resume bullets aligned with job descriptions"
          />
          <FeatureCard
            icon="✍️"
            title="Cover Letters"
            description="Personalized cover letters tailored to companies and roles"
          />
          <FeatureCard
            icon="⭐"
            title="STAR Stories"
            description="Interview prep stories based on your experience"
          />
          <FeatureCard
            icon="🔍"
            title="Job Analysis"
            description="Extract key requirements from job descriptions"
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Upload Your Resume"
              description="Share your current resume and paste a job description"
            />
            <Step
              number="2"
              title="AI Analyzes"
              description="Our AI extracts requirements and optimizes your fit"
            />
            <Step
              number="3"
              title="Get Results"
              description="Receive tailored resume, cover letter, and interview prep"
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
                "5 resume tailors/month",
                "5 cover letters/month",
                "10 STAR stories/month",
                "20 job analyses/month",
              ]}
              ctaLink="/auth/register"
            />
            <PricingCard
              name="Pro"
              price="$15"
              features={[
                "20 resume tailors/month",
                "20 cover letters/month",
                "50 STAR stories/month",
                "100 job analyses/month",
              ]}
              highlighted
              ctaLink="/auth/register"
            />
            <PricingCard
              name="Premium"
              price="$39"
              features={[
                "Unlimited usage",
                "Priority support",
                "Advanced analytics",
                "API access",
              ]}
              ctaLink="/auth/register"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="How does AI resume tailoring work?"
              answer="Our AI analyzes job descriptions and compares them with your resume. It identifies missing keywords, skills, and experience that match what recruiters are looking for, then provides specific optimization suggestions."
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
              question="How many tools can I use on the Free plan?"
              answer="The Free plan includes 5 resume tailors, 5 cover letters, 10 STAR stories, and 20 job analyses per month. Perfect for testing the platform."
            />
            <FAQItem
              question="Do you offer a refund if I'm not satisfied?"
              answer="We're confident you'll love CareerPilot. If you have any issues, contact our support team and we'll make it right."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. We use industry-standard encryption and security practices to protect your resume and personal information. Your data is never shared with third parties."
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
            Join thousands using CareerPilot to land their dream jobs
          </p>
          {!isAuthenticated && (
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started Free →
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
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
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
