"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";
import { Plan, CreditPack } from "@/lib/types";
import type { ElementType } from "react";
import FAQSection from "@/app/components/FAQ";
import {
  FileText,
  Mic,
  ClipboardList,
  Sparkles,
} from "lucide-react";

function centsToUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const fetchData = async () => {
      try {
        const [plansRes, packsRes] = await Promise.all([
          apiClient.getPlans(),
          apiClient.getCreditPacks(),
        ]);
        setPlans(plansRes);
        setCreditPacks(packsRes.packs);
      } catch (err) {
        console.error("Failed to fetch pricing data:", err);
      }
    };
    fetchData();
  }, []);

  const faqItems = useMemo(() => [
    {
      question: "How does AI resume tailoring work?",
      answer: "Our AI analyzes job descriptions and compares them with your resume. It identifies missing keywords, skills, and experience that match what recruiters are looking for, then rewrites your resume with ATS-friendly formatting and targeted bullet points.",
    },
    {
      question: "How does the Job Board Search work?",
      answer: "CareerPilot searches across Indeed, LinkedIn, Glassdoor and other major job boards simultaneously using the JSearch API. You can filter by date, employment type, remote status, and location. Save searches for later, save jobs to your application tracker, or jump straight into tailoring your resume for a specific listing.",
    },
    {
      question: "What are AI Mock Interviews?",
      answer: "Our AI interviewer conducts realistic mock interviews based on the job you're targeting. Choose text or voice mode — the AI asks tailored questions, evaluates your answers in real time, and provides a detailed scorecard with feedback on content, communication, and areas to improve.",
    },
    {
      question: "Will my resume work with Applicant Tracking Systems (ATS)?",
      answer: "Yes! Our resume optimization ensures your resume passes ATS filters. We analyze your resume against the job description to maximize match rate and ensure it's formatted correctly.",
    },
    {
      question: "Can I customize the AI-generated content?",
      answer: "Absolutely. All AI-generated content (resumes, cover letters, STAR stories) is fully editable. You can customize everything to match your voice and specific experience.",
    },
    {
      question: "How do credits work?",
      answer: "Credits are the currency for AI-powered features. Job analysis costs 1 credit, resume tailoring costs 5 credits, cover letter generation costs 2 credits, STAR story generation costs 3 credits, mock interviews cost 5 credits, and job searches cost 1 credit. Free plan users get 60 monthly credits; paid plans get their respective allotment plus any purchased credit packs.",
    },
    {
      question: "What can I do on the Free plan?",
      answer: "The Free plan includes 60 monthly credits, up to 3 resumes, resume tailoring, job analysis, STAR story generation, 5 free job searches, and the application tracker. It's perfect for testing the platform. Note: cover letter generation and AI mock interviews require a Pro or Premium subscription.",
    },
    {
      question: "Which features require a paid subscription?",
      answer: "Cover letter generation and AI mock interviews are exclusive to Pro and Premium subscribers. All other features — resume tailoring, job analysis, STAR story generation, job board search, and the application tracker — are available on every plan including Free, as long as you have credits.",
    },
    {
      question: "What are credit packs?",
      answer: `Credit packs are one-time purchases (${creditPacks.length ? creditPacks.map((p) => p.credits.toLocaleString()).join(", ").replace(/,([^,]*)$/, ", or$1") : "150, 400, or 700"} credits) that add credits to your account instantly. Purchased credits are valid for 60 days and work alongside any subscription plan. If you buy another pack before your credits expire, the expiry window is extended.`,
    },
    {
      question: "Do you offer annual billing?",
      answer: "Yes! Both Pro and Premium plans offer annual billing with a 20% discount. Pro annual is $7.99/month (billed $95.88/year) and Premium annual is $23.99/month (billed $287.88/year). You can switch between monthly and annual billing anytime.",
    },
    {
      question: "Can I cancel or change my plan anytime?",
      answer: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time with no contracts or cancellation fees. Your access continues until the end of your current billing period.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use industry-standard encryption and security practices including two-factor authentication (2FA) to protect your resume and personal information. Your data is never shared with third parties.",
    },
  ], [creditPacks]);

  const topFaqs = faqItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* ── Sticky Navigation ─────────────────────────────────────── */}
      <StickyNav />

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <div id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Platform — from search to offer
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

          <p className="mt-6 text-sm text-gray-400">
            No credit card required &bull; 60 free monthly credits &bull; Cancel anytime
          </p>
        </div>
      </div>

      {/* ── 3 Key Features ────────────────────────────────────────── */}
      <div id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Everything You Need to Land the Job
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Three powerful AI tools that give you an unfair advantage
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={FileText}
              title="AI Resume Tailoring"
              description="Get your resume rewritten with the right keywords, skills & ATS-friendly formatting for each job. Pass applicant tracking systems and impress hiring managers."
              href="/features/resume-tailoring"
            />
            <FeatureCard
              icon={Mic}
              title="AI Mock Interviews"
              description="Practice with an AI interviewer via text or voice. Get real-time scoring, feedback on your answers, and personalised tips to improve before the real thing."
              badge="Popular"
              href="/features/mock-interviews"
            />
            <FeatureCard
              icon={ClipboardList}
              title="Application Tracker"
              description="Track every job application in one dashboard — status, notes, deadlines, follow-ups. Never lose track of an opportunity again."
              href="/features/application-tracker"
            />
          </div>
          <div className="text-center mt-10">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition"
            >
              See all 8 features →
            </Link>
          </div>
        </div>
      </div>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            From finding the right job to acing the interview — CareerPilot covers every step
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Step number="1" title="Find Jobs" description="Search across major job boards or paste a job URL to get started instantly" />
            <Step number="2" title="Tailor & Apply" description="AI rewrites your resume & cover letter to match each job description perfectly" />
            <Step number="3" title="Prepare" description="Practice with AI mock interviews and build STAR stories for behavioral questions" />
            <Step number="4" title="Track & Land It" description="Track all your applications in one place and stay on top of every opportunity" />
          </div>
        </div>
      </div>

      {/* ── Social Proof ──────────────────────────────────────────── */}
      <div className="bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium text-gray-500 mb-5">Trusted by job seekers everywhere</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SocialProofStat value="500+" label="Job Seekers" />
            <SocialProofStat value="10,000+" label="Resumes Tailored" />
            <SocialProofStat value="5,000+" label="Mock Interviews" />
            <SocialProofStat value="95%" label="ATS Pass Rate" />
          </div>
        </div>
      </div>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <div id="pricing" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Simple Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(["free", "pro", "premium"] as const).map((name) => {
              const plan = plans.find((p) => p.name === name);
              const defaults: Record<string, { display: string; price: string; features: string[] }> = {
                free: { display: "Free", price: "$0", features: ["60 monthly credits", "3 resumes", "Resume tailoring", "Job analysis", "STAR story generation", "5 free job searches", "Application tracker", "Community support"] },
                pro: { display: "Pro", price: "$9.99", features: ["500 monthly credits", "20 resumes", "Advanced resume tailoring", "Cover letter generation", "AI mock interviews", "Unlimited job board search", "STAR story generation", "Application tracker", "Priority support"] },
                premium: { display: "Premium", price: "$29.99", features: ["2,000 monthly credits", "Unlimited resumes", "Unlimited resume tailoring", "Cover letter generation", "AI mock interviews", "Unlimited job board search", "STAR story generation", "Advanced analytics", "Application tracker", "Dedicated support"] },
              };
              const d = defaults[name];
              return (
                <PricingCard
                  key={name}
                  name={plan?.display_name ?? d.display}
                  price={plan ? centsToUsd(plan.price_monthly) : d.price}
                  features={plan?.features ?? d.features}
                  highlighted={name === "pro"}
                  ctaLink={name === "free" ? "/auth/register" : "/subscribe"}
                />
              );
            })}
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
              {creditPacks.map((pack) => (
                <CreditPackCard
                  key={pack.id}
                  credits={pack.credits}
                  price={`$${pack.price_usd.toFixed(2)}`}
                  perCredit={`$${(pack.price_cents / 100 / pack.credits).toFixed(3)}`}
                  bestValue={pack.popular}
                />
              ))}
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

      {/* ── FAQ (Top 5) ───────────────────────────────────────────── */}
      <div id="faq" className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection title="Frequently Asked Questions" items={topFaqs} />
        </div>
      </div>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
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
  icon: Icon,
  title,
  description,
  badge,
  href,
}: {
  icon: ElementType;
  title: string;
  description: string;
  badge?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:border-blue-200 border border-transparent transition"
    >
      {badge && (
        <span className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="mb-4 text-blue-600">
        <Icon className="w-9 h-9" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <span className="inline-flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition">
        Learn more →
      </span>
    </Link>
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

function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 pointer-events-none ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <span />
        <div className="hidden sm:flex items-center gap-6 pointer-events-auto">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/auth/register"
            className="ml-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function SocialProofStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
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
