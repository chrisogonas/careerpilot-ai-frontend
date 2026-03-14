"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Plan, CreditPack } from "@/lib/types";
import { FileText, Star, CheckCircle } from "lucide-react";
import FAQSection from "@/app/components/FAQ";

export default function SubscribePage() {
  const router = useRouter();
  const { user, isLoading, getPlans, subscription, error, createCheckoutSession, getCreditPacks, createCreditPackCheckout, getSubscription } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading2, setIsLoading2] = useState(true);
  const [packLoading, setPackLoading] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setIsLoading2(true);
        const [fetchedPlans, fetchedPacks] = await Promise.all([
          getPlans(),
          getCreditPacks(),
          getSubscription(),
        ]);
        setPlans(fetchedPlans);
        setCreditPacks(fetchedPacks);
      } catch (err) {
        console.error("Failed to fetch plans/packs:", err);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

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

  const handleBuyCreditPack = async (pack: CreditPack) => {
    if (!user) return;
    try {
      setPackLoading(pack.id);
      const successUrl = `${window.location.origin}/billing?success=true&credit_pack=true`;
      const cancelUrl = `${window.location.origin}/subscribe`;
      const checkoutUrl = await createCreditPackCheckout(pack.id, successUrl, cancelUrl);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error("Failed to create credit pack checkout:", err);
    } finally {
      setPackLoading(null);
    }
  };

  if (isLoading2 || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";
  const canShowPlans = plans && plans.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 text-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-700 mb-8">
            Unlock premium features and maximize your career potential
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedBillingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedBillingCycle === "yearly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Yearly
              <span className="ml-2 text-sm text-yellow-400">(Save 20%)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
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
                      ? "ring-2 ring-blue-500 scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  {/* Background */}
                  <div
                    className={`absolute inset-0 ${
                      plan.name === "premium"
                        ? "bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200"
                        : plan.name === "pro"
                        ? "bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200"
                        : "bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200"
                    } rounded-xl`}
                  />

                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col">
                    {/* Plan Name */}
                    <h3 className={`text-2xl font-bold mb-2 capitalize ${
                      plan.name === "premium" ? "text-blue-800" : plan.name === "pro" ? "text-blue-800" : "text-gray-800"
                    }`}>{plan.display_name}</h3>
                    <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-4xl font-bold mb-2 text-gray-900">
                        ${price.toFixed(2)}
                        <span className="text-lg text-gray-400">/mo</span>
                      </div>
                      {monthlyEquivalent && (
                        <p className="text-sm text-amber-600 font-medium">
                          Equivalent: ${monthlyEquivalent}/month
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">billed {selectedBillingCycle === "monthly" ? "monthly" : "yearly"}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-8 flex-grow">
                      <li className="flex items-center gap-2 text-gray-700"><FileText className="w-4 h-4 text-blue-600 flex-shrink-0" /> {plan.max_resumes === -1 ? "Unlimited" : plan.max_resumes} Resume(s)</li>
                      <li className="flex items-center gap-2 text-gray-700"><Star className="w-4 h-4 text-blue-600 flex-shrink-0" /> {plan.monthly_credits} Monthly Credits</li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-gray-700">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5 inline mr-1" /> Your Current Plan
                      </button>
                    ) : plan.name === "free" ? (
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
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
            <p className="text-gray-500">Loading plans...</p>
          </div>
        )}

        {/* Credit Packs Section */}
        {creditPacks.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Or Buy Credits</h2>
              <p className="text-gray-600 text-lg">
                One-time purchase &mdash; credits are <span className="font-semibold text-amber-600">valid for 60 days</span>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {creditPacks.map((pack) => {
                const isBuying = packLoading === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-lg ${
                      pack.popular
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                        Best Value
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{pack.credits.toLocaleString()} Credits</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${pack.price_usd}</span>
                        <span className="text-gray-500 ml-1">one-time</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg py-3 px-4 mb-4">
                        <span className="text-2xl font-bold text-blue-700">{pack.credits.toLocaleString()}</span>
                        <span className="text-blue-600 ml-1">credits</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-6">{pack.description}</p>
                      <button
                        onClick={() => handleBuyCreditPack(pack)}
                        disabled={isBuying}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          pack.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isBuying ? "Redirecting..." : "Buy Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Purchased credits are valid for 60 days, added to your account instantly, and can be used alongside your subscription credits.
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <FAQSection
            items={[
              {
                question: "Can I change my plan anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle. When you upgrade, you immediately receive the new plan's full monthly credit allotment.",
              },
              {
                question: "What's the difference between monthly and annual billing?",
                answer: "Annual billing saves you 20% compared to monthly. Pro annual is $7.99/month (billed $95.88/year) and Premium annual is $23.99/month (billed $287.88/year). You get the same features and credits regardless of billing cycle.",
              },
              {
                question: "How do credits work?",
                answer: "Credits are the currency for AI-powered features. Job analysis costs 1 credit, resume tailoring costs 2 credits, cover letter generation costs 2 credits, and STAR story generation costs 1 credit. Your plan's monthly credits reset each billing cycle. Subscription credits are consumed first, then purchased credits.",
              },
              {
                question: "Which features require a paid subscription?",
                answer: "Cover letter generation is available on all plans, including Free, as long as you have credits. Paid plans offer more monthly credits, additional resume storage, and premium support.",
              },
              {
                question: "Do purchased credit packs expire?",
                answer: "Yes, purchased credit packs are valid for 60 days from the date of purchase. If you buy another pack before your existing credits expire, the expiry window is extended. Your subscription credits are used first each month, so purchased credits last even longer. For the best per-credit value, consider a Pro or Premium subscription.",
              },
              {
                question: "How do credit packs compare to subscriptions?",
                answer: "Subscriptions offer the best per-credit value — Pro at ~$0.02/credit and Premium at ~$0.015/credit — plus more resume storage and premium support. Credit packs (starting at $0.025/credit) are ideal for occasional extra usage without a recurring commitment. They work alongside any plan.",
              },
              {
                question: "Can I cancel my subscription?",
                answer: "Yes, you can cancel your subscription anytime from your billing settings with no cancellation fees. Your access continues until the end of your current billing period. Any remaining purchased credits stay in your account until they expire.",
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit and debit cards through Stripe, including Visa, Mastercard, American Express, and Discover. All payments are processed securely through Stripe.",
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee on all paid subscriptions. If you're not satisfied, contact our support team for a full refund. Credit pack purchases are non-refundable once credits have been used.",
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
