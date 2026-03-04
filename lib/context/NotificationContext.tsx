'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Shared UnifiedReminder type used by ReminderBanner + NotificationTray
// ---------------------------------------------------------------------------
export interface UnifiedReminder {
  id: string;
  title: string;
  subtitle: string;
  source: 'follow_up' | 'todo';
  sourceId?: string;       // applicationId for follow-up, todoId for todo
  nextDate: string;
  reminderType: string;
  recurrenceInterval?: string;
  emailEnabled: boolean;
  emailSentAt?: string;
}

export interface ParkedReminder extends UnifiedReminder {
  parkedAt: number;        // Date.now() when it was auto-parked
}

interface NotificationContextType {
  parkedReminders: ParkedReminder[];
  parkReminder: (reminder: UnifiedReminder) => void;
  removeParkedReminder: (id: string) => void;
  clearAllParked: () => void;
}

const MAX_PARKED = 20;

const NotificationContext = createContext<NotificationContextType>({
  parkedReminders: [],
  parkReminder: () => {},
  removeParkedReminder: () => {},
  clearAllParked: () => {},
});

const STORAGE_KEY = 'careerpilot_parked_reminders';

function loadParked(): ParkedReminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveParked(items: ParkedReminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or SSR — ignore
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [parkedReminders, setParkedReminders] = useState<ParkedReminder[]>(loadParked);

  const parkReminder = useCallback((reminder: UnifiedReminder) => {
    setParkedReminders(prev => {
      // Prevent duplicates
      if (prev.some(p => p.id === reminder.id)) return prev;
      const updated = [{ ...reminder, parkedAt: Date.now() }, ...prev];
      // Cap at MAX_PARKED — oldest (last) ejected
      const capped = updated.slice(0, MAX_PARKED);
      saveParked(capped);
      return capped;
    });
  }, []);

  const removeParkedReminder = useCallback((id: string) => {
    setParkedReminders(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveParked(updated);
      return updated;
    });
  }, []);

  const clearAllParked = useCallback(() => {
    setParkedReminders([]);
    saveParked([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ parkedReminders, parkReminder, removeParkedReminder, clearAllParked }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
