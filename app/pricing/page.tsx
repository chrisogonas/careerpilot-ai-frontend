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
            description="Perfect for getting started"
            features={[
              "5 resume tailors/month",
              "5 cover letters/month",
              "10 STAR stories/month",
              "20 job analyses/month",
              "Basic support",
            ]}
            cta="Get Started"
            ctaLink="/auth/register"
          />

          <PricingCard
            name="Pro"
            price="$15"
            description="For serious job seekers"
            features={[
              "20 resume tailors/month",
              "20 cover letters/month",
              "50 STAR stories/month",
              "100 job analyses/month",
              "Email support",
              "Advanced analytics",
            ]}
            cta="Start Free Trial"
            ctaLink="/auth/register"
            highlighted
          />

          <PricingCard
            name="Premium"
            price="$39"
            description="For maximum career growth"
            features={[
              "Unlimited usage",
              "Priority support",
              "Advanced analytics",
              "API access",
              "Custom integrations",
              "Dedicated account manager",
            ]}
            cta="Get Premium"
            ctaLink="/auth/register"
          />
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FAQItem
              question="Can I change my plan?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
            />
            <FAQItem
              question="Do you offer a free trial?"
              answer="Yes! Start with our Free plan and upgrade anytime. All plans start immediately."
            />
            <FAQItem
              question="What's included in each plan?"
              answer="Each plan includes different monthly quotas for our core features. See above for details."
            />
            <FAQItem
              question="How do credits work?"
              answer="Credits are used for AI-powered features. Each action consumes credits based on complexity."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely! No contracts, no cancellation fees. Cancel from your account settings anytime."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee if you're not satisfied."
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
