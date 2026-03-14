"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import type { UserAnalytics } from "@/lib/types";

export interface UseAnalyticsReturn {
  getAnalytics: () => Promise<UserAnalytics>;
}

export function useAnalyticsApi(): UseAnalyticsReturn {
  const getAnalytics = useCallback(async (): Promise<UserAnalytics> => {
    return await apiClient.getAnalytics();
  }, []);

  return { getAnalytics };
}
