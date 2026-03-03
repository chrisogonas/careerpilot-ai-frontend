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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [parkedReminders, setParkedReminders] = useState<ParkedReminder[]>([]);

  const parkReminder = useCallback((reminder: UnifiedReminder) => {
    setParkedReminders(prev => {
      // Prevent duplicates
      if (prev.some(p => p.id === reminder.id)) return prev;
      const updated = [{ ...reminder, parkedAt: Date.now() }, ...prev];
      // Cap at MAX_PARKED — oldest (last) ejected
      return updated.slice(0, MAX_PARKED);
    });
  }, []);

  const removeParkedReminder = useCallback((id: string) => {
    setParkedReminders(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearAllParked = useCallback(() => {
    setParkedReminders([]);
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
