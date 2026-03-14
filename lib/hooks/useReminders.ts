"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import type {
  CreateReminderPayload,
  UpdateReminderPayload,
  Reminder,
  DueRemindersResponse,
  RemindersListResponse,
  SnoozeDuration,
  EmailQuotaResponse,
} from "@/lib/types";

export interface UseRemindersReturn {
  getDueReminders: () => Promise<DueRemindersResponse>;
  getReminders: (status?: string) => Promise<RemindersListResponse>;
  createReminder: (payload: CreateReminderPayload) => Promise<Reminder>;
  dismissReminder: (reminderId: string) => Promise<Reminder>;
  snoozeReminder: (reminderId: string, duration: SnoozeDuration) => Promise<Reminder>;
  completeReminder: (reminderId: string) => Promise<Reminder>;
  deleteReminder: (reminderId: string) => Promise<void>;
  updateReminder: (reminderId: string, payload: UpdateReminderPayload) => Promise<Reminder>;
  getEmailQuota: () => Promise<EmailQuotaResponse>;
}

export function useRemindersApi(): UseRemindersReturn {
  const getDueReminders = useCallback(async (): Promise<DueRemindersResponse> => {
    try {
      return await apiClient.getDueReminders();
    } catch {
      return { due_reminders: [], count: 0 };
    }
  }, []);

  const getReminders = useCallback(async (status?: string): Promise<RemindersListResponse> => {
    return await apiClient.getReminders(status);
  }, []);

  const createReminder = useCallback(async (payload: CreateReminderPayload): Promise<Reminder> => {
    return await apiClient.createReminder(payload);
  }, []);

  const dismissReminder = useCallback(async (reminderId: string): Promise<Reminder> => {
    return await apiClient.dismissReminder(reminderId);
  }, []);

  const snoozeReminder = useCallback(async (reminderId: string, duration: SnoozeDuration): Promise<Reminder> => {
    return await apiClient.snoozeReminder(reminderId, duration);
  }, []);

  const completeReminder = useCallback(async (reminderId: string): Promise<Reminder> => {
    return await apiClient.completeReminder(reminderId);
  }, []);

  const deleteReminder = useCallback(async (reminderId: string): Promise<void> => {
    await apiClient.deleteReminder(reminderId);
  }, []);

  const updateReminder = useCallback(async (reminderId: string, payload: UpdateReminderPayload): Promise<Reminder> => {
    return await apiClient.updateReminder(reminderId, payload);
  }, []);

  const getEmailQuota = useCallback(async (): Promise<EmailQuotaResponse> => {
    return await apiClient.getEmailQuota();
  }, []);

  return {
    getDueReminders,
    getReminders,
    createReminder,
    dismissReminder,
    snoozeReminder,
    completeReminder,
    deleteReminder,
    updateReminder,
    getEmailQuota,
  };
}
