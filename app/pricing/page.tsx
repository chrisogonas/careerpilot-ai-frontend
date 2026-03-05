"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";
import { Plan, CreditPack } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helper: format cents to "$X.XX"
// ---------------------------------------------------------------------------
function centsToUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Helper: build FAQ items dynamically from fetched data
// ---------------------------------------------------------------------------
function buildFaqItems(
  plans: Plan[],
  creditPacks: CreditPack[]
): { question: string; answer: string }[] {
  const free = plans.find((p) => p.name === "free");
  const pro = plans.find((p) => p.name === "pro");
  const premium = plans.find((p) => p.name === "premium");

  const freeCredits = free?.monthly_credits ?? 60;
  const proPrice = pro ? centsToUsd(pro.price_monthly) : "$9.99";
  const premiumPrice = premium ? centsToUsd(premium.price_monthly) : "$29.99";
  const proCredits = pro?.monthly_credits ?? 500;
  const premiumCredits = premium?.monthly_credits ?? 2000;

  const proYearlyPerMonth = pro
    ? `$${(pro.price_yearly / 100 / 12).toFixed(2)}`
    : "$7.99";
  const premiumYearlyPerMonth = premium
    ? `$${(premium.price_yearly / 100 / 12).toFixed(2)}`
    : "$23.99";

  // Credit-pack value comparison strings
  const cheapestPack = creditPacks.length
    ? creditPacks.reduce((a, b) =>
        a.price_cents / a.credits < b.price_cents / b.credits ? a : b
      )
    : null;
  const cheapestPerCredit = cheapestPack
    ? `$${(cheapestPack.price_cents / 100 / cheapestPack.credits).toFixed(3)}`
    : "$0.025";

  const proPerCredit = pro
    ? `~$${(pro.price_monthly / 100 / pro.monthly_credits).toFixed(3)}`
    : "~$0.02";
  const premiumPerCredit = premium
    ? `~$${(premium.price_monthly / 100 / premium.monthly_credits).toFixed(3)}`
    : "~$0.015";

  // Build pack sizes string (e.g., "200, 400, or 700 credits")
  const packSizes = creditPacks.length
    ? creditPacks
        .map((p) => p.credits.toLocaleString())
        .join(", ")
        .replace(/,([^,]*)$/, ", or$1")
    : "200, 400, or 700";

  return [
    {
      question: "How do credits work?",
      answer: `Credits are the currency for AI-powered features. Job analysis costs 1 credit, resume tailoring costs 2, cover letters cost 2, and STAR stories cost 1. Your remaining credits are calculated dynamically based on your total budget minus actual usage this month. Free plan users get ${freeCredits} credits; paid plans get their respective allotment plus any purchased credit packs.`,
    },
    {
      question: "What\u2019s the difference between plans?",
      answer: `Free gives you ${freeCredits} credits/month and access to resume tailoring, job analysis, cover letter generation, and STAR stories. Pro (${proPrice}/mo) adds ${proCredits.toLocaleString()} credits, priority support, and more resumes. Premium (${premiumPrice}/mo) gives ${premiumCredits.toLocaleString()} credits, unlimited resumes, advanced analytics, and dedicated support. Note: free credits are forfeited if you purchase a credit pack or subscribe to a paid plan.`,
    },
    {
      question: "Which features require a paid plan?",
      answer:
        "All AI-powered features \u2014 resume tailoring, job analysis, cover letter generation, and STAR story generation \u2014 are available on every plan including Free, as long as you have credits. Paid plans offer more credits, additional resumes, and premium support.",
    },
    {
      question: "Do you offer annual billing?",
      answer: `Yes! Save 20% with annual billing on Pro (${proYearlyPerMonth}/mo billed yearly) and Premium (${premiumYearlyPerMonth}/mo billed yearly). Toggle between monthly and annual on the subscribe page.`,
    },
    {
      question: "What are credit packs?",
      answer: `Credit packs are one-time purchases (${packSizes} credits) that add credits to your account instantly. They work alongside your subscription and are valid for 60 days. Buying another pack extends the expiry window. If you are on the Free plan and buy a credit pack, your free monthly credits are forfeited \u2014 only your purchased credits will count.`,
    },
    {
      question: "How do credit packs compare to subscriptions?",
      answer: `Subscriptions offer the best per-credit value (Pro: ${proPerCredit}/credit, Premium: ${premiumPerCredit}/credit) plus more resumes and premium support. Credit packs (starting at ${cheapestPerCredit}/credit) are ideal for occasional extra usage without a recurring commitment.`,
    },
    {
      question: "Can I change or cancel my plan?",
      answer:
        "Yes! Upgrade, downgrade, or cancel anytime with no contracts or fees. Changes take effect on your next billing cycle and your access continues until the end of the current period.",
    },
    {
      question: "Do you offer a free trial?",
      answer: `Yes! The Free plan is always available with ${freeCredits} monthly credits \u2014 no credit card required. Try out resume tailoring, job analysis, and STAR stories before upgrading.`,
    },
    {
      question: "What happens to my credits if I upgrade?",
      answer:
        "When you upgrade, you receive the new plan\u2019s full monthly credit allotment immediately. Any purchased credits remain in your account and continue with their existing expiry date.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee on all paid subscriptions. Contact our support team if you\u2019re not satisfied.",
    },
  ];
}

// ===========================================================================
// Page Component
// ===========================================================================

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Determine plan ordering & highlight
  const planOrder = ["free", "pro", "premium"];
  const orderedPlans = planOrder
    .map((name) => plans.find((p) => p.name === name))
    .filter(Boolean) as Plan[];

  const ctaMap: Record<string, { cta: string; link: string }> = {
    free: { cta: "Get Started", link: "/auth/register" },
    pro: { cta: "Start Free Trial", link: "/subscribe" },
    premium: { cta: "Get Premium", link: "/subscribe" },
  };

  const faqItems = buildFaqItems(plans, creditPacks);

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
          {orderedPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.display_name}
              price={centsToUsd(plan.price_monthly)}
              description={plan.description}
              features={plan.features}
              cta={ctaMap[plan.name]?.cta ?? "Get Started"}
              ctaLink={ctaMap[plan.name]?.link ?? "/subscribe"}
              highlighted={plan.name === "pro"}
            />
          ))}
        </div>

        {/* Pay As You Go Credit Packs */}
        {creditPacks.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Or Buy Credits As You Go
            </h2>
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
                  ctaLink="/subscribe"
                  bestValue={pack.popular}
                />
              ))}
            </div>
            <p className="text-center text-gray-500 mt-6 text-sm">
              Purchased credits are valid for 60 days and work with any plan.
            </p>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqItems.map((item, idx) => (
              <FAQItem key={idx} question={item.question} answer={item.answer} />
            ))}
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


