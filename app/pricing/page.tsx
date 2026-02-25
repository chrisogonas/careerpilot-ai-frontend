"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function PricingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your career goals
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <PricingCard
            name="Free"
            price="$0"
            description="Get started with basic AI-powered career tools"
            features={[
              "60 monthly credits",
              "3 resumes",
              "Basic resume tailoring",
              "Basic job analysis",
              "Cover letter generation",
              "STAR story generation",
              "Community support",
            ]}
            cta="Get Started"
            ctaLink="/auth/register"
          />

          <PricingCard
            name="Pro"
            price="$9.99"
            description="Advanced tools for serious job seekers"
            features={[
              "500 monthly credits",
              "20 resumes",
              "Advanced resume tailoring",
              "Cover letter generation",
              "STAR story generation",
              "Priority support",
              "Save 20% with annual billing",
            ]}
            cta="Start Free Trial"
            ctaLink="/subscribe"
            highlighted
          />

          <PricingCard
            name="Premium"
            price="$29.99"
            description="Unlimited access for power users"
            features={[
              "2,000 monthly credits",
              "Unlimited resumes",
              "Unlimited resume tailoring",
              "Cover letter generation",
              "STAR story generation",
              "Advanced analytics",
              "Dedicated support",
              "Save 20% with annual billing",
            ]}
            cta="Get Premium"
            ctaLink="/subscribe"
          />
        </div>

        {/* Pay As You Go Credit Packs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Or Buy Credits As You Go
          </h2>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Need extra credits? Purchase one-time credit packs — valid for 60 days.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <CreditPackCard
              credits={200}
              price="$4.99"
              perCredit="$0.025"
              ctaLink="/subscribe"
            />
            <CreditPackCard
              credits={400}
              price="$11.99"
              perCredit="$0.030"
              ctaLink="/subscribe"
              bestValue
            />
            <CreditPackCard
              credits={700}
              price="$19.99"
              perCredit="$0.029"
              ctaLink="/subscribe"
            />
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Purchased credits are valid for 60 days and work with any plan.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FAQItem
              question="How do credits work?"
              answer="Credits are the currency for AI-powered features. Job analysis costs 1 credit, resume tailoring costs 2, cover letters cost 2, and STAR stories cost 1. Your remaining credits are calculated dynamically based on your total budget minus actual usage this month. Free plan users get 60 credits; paid plans get their respective allotment plus any purchased credit packs."
            />
            <FAQItem
              question="What's the difference between plans?"
              answer="Free gives you 60 credits/month and access to resume tailoring, job analysis, cover letter generation, and STAR stories. Pro ($9.99/mo) adds 500 credits, priority support, and more resumes. Premium ($29.99/mo) gives 2,000 credits, unlimited resumes, advanced analytics, and dedicated support. Note: free credits are forfeited if you purchase a credit pack or subscribe to a paid plan."
            />
            <FAQItem
              question="Which features require a paid plan?"
              answer="All AI-powered features — resume tailoring, job analysis, cover letter generation, and STAR story generation — are available on every plan including Free, as long as you have credits. Paid plans offer more credits, additional resumes, and premium support."
            />
            <FAQItem
              question="Do you offer annual billing?"
              answer="Yes! Save 20% with annual billing on Pro ($7.99/mo billed yearly) and Premium ($23.99/mo billed yearly). Toggle between monthly and annual on the subscribe page."
            />
            <FAQItem
              question="What are credit packs?"
              answer="Credit packs are one-time purchases (200, 400, or 700 credits) that add credits to your account instantly. They work alongside your subscription and are valid for 60 days. Buying another pack extends the expiry window. If you are on the Free plan and buy a credit pack, your free monthly credits are forfeited — only your purchased credits will count."
            />
            <FAQItem
              question="How do credit packs compare to subscriptions?"
              answer="Subscriptions offer the best per-credit value (Pro: ~$0.02/credit, Premium: ~$0.015/credit) plus more resumes and premium support. Credit packs (starting at $0.025/credit) are ideal for occasional extra usage without a recurring commitment."
            />
            <FAQItem
              question="Can I change or cancel my plan?"
              answer="Yes! Upgrade, downgrade, or cancel anytime with no contracts or fees. Changes take effect on your next billing cycle and your access continues until the end of the current period."
            />
            <FAQItem
              question="Do you offer a free trial?"
              answer="Yes! The Free plan is always available with 60 monthly credits — no credit card required. Try out resume tailoring, job analysis, and STAR stories before upgrading."
            />
            <FAQItem
              question="What happens to my credits if I upgrade?"
              answer="When you upgrade, you receive the new plan's full monthly credit allotment immediately. Any purchased credits remain in your account and continue with their existing expiry date."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee on all paid subscriptions. Contact our support team if you're not satisfied."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to advance your career?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of job seekers using CareerPilot
          </p>
          {!isAuthenticated && (
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Start for Free →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-8 transition ${
        highlighted
          ? "bg-blue-600 text-white shadow-2xl scale-105"
          : "bg-white border-2 border-gray-200"
      }`}
    >
      <h3 className={`text-2xl font-bold ${highlighted ? "text-white" : "text-gray-900"}`}>
        {name}
      </h3>
      <p className={`mt-2 ${highlighted ? "text-blue-100" : "text-gray-600"}`}>
        {description}
      </p>

      <div className={`mt-4 text-5xl font-bold ${highlighted ? "text-white" : "text-gray-900"}`}>
        {price}
        <span className={`text-lg font-normal ${highlighted ? "text-blue-100" : "text-gray-600"}`}>
          /month
        </span>
      </div>

      <ul className={`mt-8 space-y-4 mb-8`}>
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex items-start ${
              highlighted ? "text-blue-100" : "text-gray-700"
            }`}
          >
            <span className="mr-3 text-lg">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        className={`block w-full py-3 rounded-lg font-semibold text-center transition ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-gray-100"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {cta}
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
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}

function CreditPackCard({
  credits,
  price,
  perCredit,
  ctaLink,
  bestValue = false,
}: {
  credits: number;
  price: string;
  perCredit: string;
  ctaLink: string;
  bestValue?: boolean;
}) {
  return (
    <div className={`relative bg-white rounded-lg p-6 border-2 ${
      bestValue ? "border-green-500 shadow-lg" : "border-gray-200"
    }`}>
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
        <div className="text-xs text-amber-600 font-semibold mb-4">Valid for 60 days</div>
        <Link
          href={ctaLink}
          className="block w-full py-2 rounded-lg font-semibold text-center bg-green-600 text-white hover:bg-green-700 transition"
        >
          Buy Credits
        </Link>
      </div>
    </div>
  );
}
