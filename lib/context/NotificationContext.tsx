'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

// ---------- Per-user localStorage helpers ----------

const STORAGE_PREFIX = 'careerpilot_parked_reminders';

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}_${userId}` : STORAGE_PREFIX;
}

function loadParked(userId: string | null): ParkedReminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveParked(items: ParkedReminder[], userId: string | null) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
  } catch {
    // quota exceeded or SSR — ignore
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const prevUserIdRef = useRef<string | null>(userId);

  const [parkedReminders, setParkedReminders] = useState<ParkedReminder[]>(() => loadParked(userId));

  // When user changes (login/logout/switch), reload that user's parked data
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      setParkedReminders(loadParked(userId));
    }
    // One-time cleanup: remove the old global (non-scoped) key if it exists
    try { localStorage.removeItem(STORAGE_PREFIX); } catch { /* ignore */ }
  }, [userId]);

  const parkReminder = useCallback((reminder: UnifiedReminder) => {
    setParkedReminders(prev => {
      // Prevent duplicates
      if (prev.some(p => p.id === reminder.id)) return prev;
      const updated = [{ ...reminder, parkedAt: Date.now() }, ...prev];
      // Cap at MAX_PARKED — oldest (last) ejected
      const capped = updated.slice(0, MAX_PARKED);
      saveParked(capped, userId);
      return capped;
    });
  }, [userId]);

  const removeParkedReminder = useCallback((id: string) => {
    setParkedReminders(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveParked(updated, userId);
      return updated;
    });
  }, [userId]);

  const clearAllParked = useCallback(() => {
    setParkedReminders([]);
    saveParked([], userId);
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ parkedReminders, parkReminder, removeParkedReminder, clearAllParked }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
