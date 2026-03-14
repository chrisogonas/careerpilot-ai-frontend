"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import type {
  JobApplication,
  CreateApplicationPayload,
  UpdateApplicationPayload,
  AddFollowUpPayload,
  FollowUp,
  GetApplicationResponse,
} from "@/lib/types";

export interface UseApplicationsReturn {
  getApplications: () => Promise<JobApplication[]>;
  getApplication: (id: string) => Promise<GetApplicationResponse>;
  createApplication: (payload: CreateApplicationPayload) => Promise<JobApplication>;
  updateApplication: (id: string, payload: UpdateApplicationPayload) => Promise<JobApplication>;
  deleteApplication: (id: string) => Promise<void>;
  addFollowUp: (applicationId: string, payload: AddFollowUpPayload) => Promise<FollowUp>;
  deleteFollowUp: (applicationId: string, followUpId: string) => Promise<void>;
}

export function useApplicationsApi(
  onApplicationsChanged?: (updater: (prev: JobApplication[]) => JobApplication[]) => void
): UseApplicationsReturn {
  const getApplications = useCallback(async (): Promise<JobApplication[]> => {
    const data = await apiClient.getApplications();
    onApplicationsChanged?.(() => data);
    return data;
  }, [onApplicationsChanged]);

  const getApplication = useCallback(async (id: string): Promise<GetApplicationResponse> => {
    return await apiClient.getApplication(id);
  }, []);

  const createApplication = useCallback(async (payload: CreateApplicationPayload): Promise<JobApplication> => {
    const newApplication = await apiClient.createApplication(payload);
    onApplicationsChanged?.((prev) => [...prev, newApplication]);
    return newApplication;
  }, [onApplicationsChanged]);

  const updateApplication = useCallback(async (id: string, payload: UpdateApplicationPayload): Promise<JobApplication> => {
    const updatedApplication = await apiClient.updateApplication(id, payload);
    onApplicationsChanged?.((prev) => prev.map((a) => (a.id === id ? updatedApplication : a)));
    return updatedApplication;
  }, [onApplicationsChanged]);

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteApplication(id);
    onApplicationsChanged?.((prev) => prev.filter((a) => a.id !== id));
  }, [onApplicationsChanged]);

  const addFollowUp = useCallback(async (applicationId: string, payload: AddFollowUpPayload): Promise<FollowUp> => {
    const followUp = await apiClient.addFollowUp(applicationId, payload);
    onApplicationsChanged?.((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? { ...a, follow_up_count: a.follow_up_count + 1, last_follow_up_at: new Date().toISOString() }
          : a
      )
    );
    return followUp;
  }, [onApplicationsChanged]);

  const deleteFollowUp = useCallback(async (applicationId: string, followUpId: string): Promise<void> => {
    await apiClient.deleteFollowUp(applicationId, followUpId);
    onApplicationsChanged?.((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? { ...a, follow_up_count: Math.max(0, a.follow_up_count - 1) }
          : a
      )
    );
  }, [onApplicationsChanged]);

  return {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    addFollowUp,
    deleteFollowUp,
  };
}
