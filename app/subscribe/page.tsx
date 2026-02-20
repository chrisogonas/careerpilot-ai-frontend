"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Plan } from "@/lib/types";

export default function SubscribePage() {
  const router = useRouter();
  const { user, isLoading, getPlans, subscription, error, createCheckoutSession } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading2, setIsLoading2] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchPlans = async () => {
      try {
        setIsLoading2(true);
        const fetchedPlans = await getPlans();
        setPlans(fetchedPlans);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchPlans();
  }, [user, router, getPlans]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!plan.stripe_price_id_monthly && !plan.stripe_price_id_yearly) {
      console.error("Plan does not have Stripe price ID");
      return;
    }

    const priceId =
      selectedBillingCycle === "monthly"
        ? plan.stripe_price_id_monthly
        : plan.stripe_price_id_yearly;

    if (!priceId) {
      console.error(`Plan does not have ${selectedBillingCycle} pricing`);
      return;
    }

    try {
      const successUrl = `${window.location.origin}/billing?success=true`;
      const cancelUrl = `${window.location.origin}/subscribe`;

      const checkoutUrl = await createCheckoutSession(priceId, successUrl, cancelUrl);

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Failed to create checkout session:", err);
    }
  };

  if (isLoading2 || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";
  const canShowPlans = plans && plans.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-slate-300 mb-8">
            Unlock premium features and maximize your career potential
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedBillingCycle === "monthly"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedBillingCycle === "yearly"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Yearly
              <span className="ml-2 text-sm text-yellow-400">(Save 20%)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        {canShowPlans ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const price =
                selectedBillingCycle === "monthly"
                  ? plan.price_monthly / 100
                  : plan.price_yearly / 100;
              const monthlyEquivalent =
                selectedBillingCycle === "yearly" ? (price / 12).toFixed(2) : null;
              const isCurrentPlan = currentPlan === plan.name;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl overflow-hidden transition-all ${
                    isCurrentPlan
                      ? "ring-2 ring-purple-500 scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  {/* Background */}
                  <div
                    className={`absolute inset-0 ${
                      plan.name === "premium"
                        ? "bg-gradient-to-br from-purple-900 to-slate-900"
                        : plan.name === "pro"
                        ? "bg-gradient-to-br from-blue-900 to-slate-900"
                        : "bg-gradient-to-br from-slate-800 to-slate-900"
                    }`}
                  />

                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col">
                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold mb-2 capitalize">{plan.display_name}</h3>
                    <p className="text-slate-300 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-4xl font-bold mb-2">
                        ${price.toFixed(2)}
                        <span className="text-lg text-slate-300">/mo</span>
                      </div>
                      {monthlyEquivalent && (
                        <p className="text-sm text-yellow-400">
                          Equivalent: ${monthlyEquivalent}/month
                        </p>
                      )}
                      <p className="text-slate-400 text-sm">billed {selectedBillingCycle}ly</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-8 flex-grow">
                      <li className="text-slate-300">📄 {plan.max_resumes} Resume(s)</li>
                      <li className="text-slate-300">⭐ {plan.monthly_credits} Monthly Credits</li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-slate-300">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-not-allowed"
                      >
                        🎉 Your Current Plan
                      </button>
                    ) : plan.name === "free" ? (
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        Go to Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          plan.name === "premium"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {currentPlan === "free" ? "Upgrade Now" : "Change Plan"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading plans...</p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold">
                Can I change my plan anytime?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately
                on your next billing cycle.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold">
                Do you offer refunds?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-300">
                We offer a 30-day money-back guarantee. If you're not satisfied with your subscription,
                contact us for a full refund.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold">
                What payment methods do you accept?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-300">
                We accept all major credit and debit cards through Stripe, including Visa, Mastercard,
                American Express, and Discover.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold">
                Can I cancel my subscription?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-300">
                Yes, you can cancel your subscription anytime from your billing settings. Your access
                will continue until the end of your current billing period.
              </p>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
