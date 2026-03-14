"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import type { Plan, BillingEvent, CreditPack, Subscription } from "@/lib/types";

export interface UseSubscriptionReturn {
  getSubscription: () => Promise<{ subscription: Subscription | null; current_plan: Plan | null }>;
  getPlans: () => Promise<Plan[]>;
  createCheckoutSession: (priceId: string, successUrl: string, cancelUrl: string) => Promise<string>;
  updateSubscription: (subscriptionId: string, newPlan: "free" | "pro" | "premium", billingCycle?: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: (subscriptionId: string | undefined, atPeriodEnd?: boolean) => Promise<void>;
  getBillingHistory: () => Promise<BillingEvent[]>;
  getCreditPacks: () => Promise<CreditPack[]>;
  createCreditPackCheckout: (packId: string, successUrl: string, cancelUrl: string) => Promise<string>;
}

export function useSubscriptionApi(): UseSubscriptionReturn {
  const getSubscription = useCallback(async () => {
    return await apiClient.getSubscription();
  }, []);

  const getPlans = useCallback(async (): Promise<Plan[]> => {
    return await apiClient.getPlans();
  }, []);

  const createCheckoutSession = useCallback(async (
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> => {
    const response = await apiClient.createCheckoutSession({
      price_id: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return response.url;
  }, []);

  const updateSubscription = useCallback(async (
    subscriptionId: string,
    newPlan: "free" | "pro" | "premium",
    billingCycle?: "monthly" | "yearly"
  ) => {
    await apiClient.updateSubscription({
      subscription_id: subscriptionId,
      new_plan: newPlan,
      billing_cycle: billingCycle,
    });
  }, []);

  const cancelSubscription = useCallback(async (subscriptionId: string | undefined, atPeriodEnd: boolean = true) => {
    await apiClient.cancelSubscription({
      subscription_id: subscriptionId,
      at_period_end: atPeriodEnd,
    });
  }, []);

  const getBillingHistory = useCallback(async (): Promise<BillingEvent[]> => {
    const response = await apiClient.getBillingHistory();
    return response.events;
  }, []);

  const getCreditPacks = useCallback(async (): Promise<CreditPack[]> => {
    const response = await apiClient.getCreditPacks();
    return response.packs;
  }, []);

  const createCreditPackCheckout = useCallback(async (
    packId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> => {
    const response = await apiClient.createCreditPackCheckout(packId, successUrl, cancelUrl);
    return response.url;
  }, []);

  return {
    getSubscription,
    getPlans,
    createCheckoutSession,
    updateSubscription,
    cancelSubscription,
    getBillingHistory,
    getCreditPacks,
    createCreditPackCheckout,
  };
}
