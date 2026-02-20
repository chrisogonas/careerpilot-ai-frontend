"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { BillingEvent } from "@/lib/types";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, currentPlan, isLoading, getSubscription, getBillingHistory, cancelSubscription } =
    useAuth();
  const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const success = searchParams.get("success");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading2(true);
        await getSubscription();
        const history = await getBillingHistory();
        setBillingHistory(history);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchData();
  }, [user, router, getSubscription, getBillingHistory]);

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true);
      await cancelSubscription(true);
      setShowCancelModal(false);
      // Refresh subscription data
      await getSubscription();
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (isLoading || isLoading2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-slate-400">Manage your subscription and billing information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400 flex items-start gap-3">
            <span className="text-xl">✓</span>
            <div>
              <p className="font-semibold">Payment Successful!</p>
              <p className="text-sm">Your subscription has been updated. Thank you for your purchase.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Current Plan Card */}
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">Current Plan</h2>

            {subscription ? (
              <>
                <div className="mb-6">
                  <p className="text-slate-400 text-sm mb-1">Plan</p>
                  <p className="text-2xl font-bold capitalize">{subscription.plan} Plan</p>
                </div>

                <div className="space-y-4 mb-8 pb-8 border-b border-slate-700">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          subscription.status === "active"
                            ? "bg-green-900/20 text-green-400"
                            : subscription.status === "canceled"
                            ? "bg-red-900/20 text-red-400"
                            : "bg-yellow-900/20 text-yellow-400"
                        }`}
                      >
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-1">Billing Cycle</p>
                    <p className="capitalize">{subscription.billing_cycle}ly</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-1">Current Period</p>
                    <p>
                      {formatDate(subscription.current_period_start)} -{" "}
                      {subscription.current_period_end ? formatDate(subscription.current_period_end) : "N/A"}
                    </p>
                  </div>

                  {subscription.status === "canceled" && subscription.canceled_at && (
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Cancellation Date</p>
                      <p>{formatDate(subscription.canceled_at)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/subscribe")}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Change Plan
                  </button>

                  {subscription.status === "active" && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg font-semibold transition-colors border border-red-500/30"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">No active subscription</p>
                <button
                  onClick={() => router.push("/subscribe")}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>

          {/* Plan Details Card */}
          {currentPlan && (
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 capitalize">{currentPlan.display_name} Plan</h2>

              <div className="space-y-3 mb-8 pb-8 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">📄 Max Resumes</span>
                  <span className="font-semibold">{currentPlan.max_resumes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">⭐ Monthly Credits</span>
                  <span className="font-semibold">{currentPlan.monthly_credits}</span>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-3">Features</p>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Billing History</h2>

          {billingHistory && billingHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Type</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((event) => (
                    <tr key={event.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4">{formatDate(event.created_at)}</td>
                      <td className="py-3 px-4">{event.description}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            event.type === "charge"
                              ? "bg-red-900/20 text-red-400"
                              : event.type === "refund"
                              ? "bg-blue-900/20 text-blue-400"
                              : "bg-green-900/20 text-green-400"
                          }`}
                        >
                          {event.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {event.type === "refund" ? "-" : "+"}${formatPrice(event.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No billing history yet</p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="mt-8 bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
          <p className="text-slate-400 mb-4">
            You can manage your payment methods in the{" "}
            <a href="https://billing.stripe.com/login" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Stripe customer portal
            </a>
            .
          </p>
          <button
            onClick={() => window.open("https://billing.stripe.com/login", "_blank")}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Manage Payment Methods
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-4 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Cancel Subscription?</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the
              end of your billing period.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                disabled={isCanceling}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                disabled={isCanceling}
              >
                {isCanceling ? "Canceling..." : "Yes, Cancel Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
