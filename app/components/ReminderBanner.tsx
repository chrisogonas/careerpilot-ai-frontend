'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotifications, UnifiedReminder } from '@/lib/context/NotificationContext';
import { Reminder, TodoReminder, SnoozeDuration } from '@/lib/types';

const POLL_INTERVAL = 60_000; // 60 seconds
const CYCLE_INTERVAL = 6_000; // 6 seconds per reminder
const AUTO_DISMISS_MS = 60_000; // Auto-park to notification tray after 60s

// ---------------------------------------------------------------------------
// Soft chime via Web Audio API (no external file needed)
// Plays two quick ascending tones that feel like a friendly notification.
// ---------------------------------------------------------------------------
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const playTone = (freq: number, startSec: number, durSec: number, gain: number) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      vol.gain.setValueAtTime(gain, ctx.currentTime + startSec);
      // Gentle fade-out so it doesn't click
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startSec + durSec);
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.start(ctx.currentTime + startSec);
      osc.stop(ctx.currentTime + startSec + durSec);
    };

    // Two friendly ascending notes (C6 → E6)
    playTone(1047, 0, 0.15, 0.18);   // C6
    playTone(1319, 0.12, 0.22, 0.14); // E6

    // Close context after sounds finish to free resources
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {
    // Web Audio not supported — degrade silently
  }
}

const SNOOZE_OPTIONS: { label: string; value: SnoozeDuration }[] = [
  { label: '5 min', value: '5m' },
  { label: '10 min', value: '10m' },
  { label: '15 min', value: '15m' },
  { label: '1 hour', value: '1h' },
  { label: '4 hours', value: '4h' },
  { label: '1 day', value: '1d' },
  { label: '1 week', value: '1w' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ReminderBanner() {
  const {
    isAuthenticated, getDueReminders, dismissReminder, snoozeReminder, deleteReminder,
    getDueTodoReminders, snoozeTodoReminder, dismissTodoReminder, deleteTodoReminder,
    subscription, currentPlan,
  } = useAuth();
  const { parkReminder, parkedReminders } = useNotifications();
  const router = useRouter();

  const [reminders, setReminders] = useState<UnifiedReminder[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const snoozeRef = useRef<HTMLDivElement>(null);
  const prevReminderIdsRef = useRef<Set<string>>(new Set());

  // Auto-dismiss tracking
  const firstSeenRef = useRef<Map<string, number>>(new Map());
  const parkedRemindersRef = useRef(parkedReminders);
  parkedRemindersRef.current = parkedReminders;

  const isPaidPlan = subscription && currentPlan && currentPlan.name !== 'free' && ['active', 'trialing'].includes(subscription.status);

  // Convert raw Reminder to unified
  const toUnifiedFollowUp = (r: Reminder): UnifiedReminder => ({
    id: `fu_${r.id}`,
    title: r.title,
    subtitle: r.application?.company_name && r.application?.job_title
      ? `${r.application.company_name} — ${r.application.job_title}`
      : 'Follow-up reminder',
    source: 'follow_up',
    sourceId: r.application_id,
    nextDate: r.next_reminder_date || r.reminder_date,
    reminderType: r.reminder_type,
    recurrenceInterval: r.recurrence_interval,
    emailEnabled: r.email_enabled || false,
    emailSentAt: r.email_sent_at,
  });

  // Convert TodoReminder to unified
  const toUnifiedTodo = (r: TodoReminder): UnifiedReminder => ({
    id: `td_${r.id}`,
    title: r.title,
    subtitle: 'Todo reminder',
    source: 'todo',
    sourceId: r.todo_id,
    nextDate: r.next_reminder_date || r.reminder_date,
    reminderType: r.reminder_type,
    recurrenceInterval: r.recurrence_interval,
    emailEnabled: r.email_enabled || false,
    emailSentAt: r.email_sent_at,
  });

  const fetchReminders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // TODO reminders are available to ALL plans; follow-up reminders are paid-only
      const [fuData, tdData] = await Promise.all([
        isPaidPlan
          ? getDueReminders().catch(() => ({ due_reminders: [] }))
          : Promise.resolve({ due_reminders: [] as Reminder[] }),
        getDueTodoReminders().catch(() => ({ due_reminders: [] })),
      ]);

      const fuItems: UnifiedReminder[] = (fuData.due_reminders || []).map(toUnifiedFollowUp);
      const tdItems: UnifiedReminder[] = (tdData.due_reminders || []).map(toUnifiedTodo);

      // Filter out reminders already parked in the notification tray
      const parkedIds = new Set(parkedRemindersRef.current.map(p => p.id));
      const incoming = [...fuItems, ...tdItems].filter(r => !parkedIds.has(r.id));

      // Track first-seen timestamps for auto-dismiss countdown
      const now = Date.now();
      incoming.forEach(r => {
        if (!firstSeenRef.current.has(r.id)) {
          firstSeenRef.current.set(r.id, now);
        }
      });
      // Clean up stale first-seen entries
      const incomingIds = new Set(incoming.map(r => r.id));
      for (const id of firstSeenRef.current.keys()) {
        if (!incomingIds.has(id)) {
          firstSeenRef.current.delete(id);
        }
      }

      setReminders(incoming);

      // Play chime only when genuinely new reminders appear
      const prevIds = prevReminderIdsRef.current;
      const hasNew = incoming.some((r) => !prevIds.has(r.id));
      if (hasNew && incoming.length > 0) {
        playChime();
      }
      prevReminderIdsRef.current = new Set(incoming.map((r) => r.id));
    } catch {
      // Silently fail
    }
  }, [isAuthenticated, isPaidPlan, getDueReminders, getDueTodoReminders]);

  // Initial fetch + polling
  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  // Auto-dismiss: every second, park reminders that have been visible for 60s+
  // We split the work into two phases so parkReminder (which sets state in
  // NotificationProvider) is never called *inside* the setReminders updater —
  // React forbids setting state on another component during a state update.
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const topark: UnifiedReminder[] = [];

      // Phase 1: identify & remove expired reminders from the banner list
      setReminders(prev => {
        const remaining: UnifiedReminder[] = [];

        for (const r of prev) {
          const firstSeen = firstSeenRef.current.get(r.id);
          if (firstSeen && (now - firstSeen) >= AUTO_DISMISS_MS) {
            topark.push(r);
            firstSeenRef.current.delete(r.id);
          } else {
            remaining.push(r);
          }
        }

        return topark.length > 0 ? remaining : prev;
      });

      // Phase 2: park the collected reminders *after* setReminders completes
      if (topark.length > 0) {
        topark.forEach(r => parkReminder(r));
      }
    }, 1_000);

    return () => clearInterval(timer);
  }, [parkReminder]);

  // Cycle through reminders
  useEffect(() => {
    if (reminders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reminders.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [reminders.length]);

  // Close snooze dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (snoozeRef.current && !snoozeRef.current.contains(e.target as Node)) {
        setSnoozeOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep index in bounds when reminders change
  useEffect(() => {
    if (currentIndex >= reminders.length) {
      setCurrentIndex(Math.max(0, reminders.length - 1));
    }
  }, [reminders.length, currentIndex]);

  const handleDismiss = async (unified: UnifiedReminder) => {
    setActionLoading(unified.id);
    try {
      if (unified.source === 'follow_up') {
        const realId = unified.id.replace('fu_', '');
        await dismissReminder(realId);
      } else {
        await dismissTodoReminder(unified.sourceId!);
      }
      firstSeenRef.current.delete(unified.id);
      setReminders((prev) => prev.filter((r) => r.id !== unified.id));
    } catch (err) {
      console.error('Dismiss failed:', err);
      // Optimistic: still remove so user isn't stuck
      firstSeenRef.current.delete(unified.id);
      setReminders((prev) => prev.filter((r) => r.id !== unified.id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSnooze = async (unified: UnifiedReminder, duration: SnoozeDuration) => {
    setSnoozeOpenId(null);
    setActionLoading(unified.id);
    try {
      if (unified.source === 'follow_up') {
        const realId = unified.id.replace('fu_', '');
        await snoozeReminder(realId, duration);
      } else {
        await snoozeTodoReminder(unified.sourceId!, duration);
      }
      firstSeenRef.current.delete(unified.id);
      setReminders((prev) => prev.filter((r) => r.id !== unified.id));
    } catch (err) {
      console.error('Snooze failed:', err);
      firstSeenRef.current.delete(unified.id);
      setReminders((prev) => prev.filter((r) => r.id !== unified.id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (unified: UnifiedReminder) => {
    setActionLoading(unified.id);
    try {
      if (unified.source === 'follow_up') {
        const realId = unified.id.replace('fu_', '');
        await deleteReminder(realId);
      } else {
        await deleteTodoReminder(unified.sourceId!);
      }
      firstSeenRef.current.delete(unified.id);
      setReminders((prev) => prev.filter((r) => r.id !== unified.id));
    } catch (err) {
      console.error('Delete failed:', err);
      firstSeenRef.current.delete(unified.id);
      setReminders((prev) => prev.filter((r) => r.id !== unified.id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleNavigate = (unified: UnifiedReminder) => {
    if (unified.source === 'follow_up' && unified.sourceId) {
      router.push(`/applications/${unified.sourceId}`);
    } else if (unified.source === 'todo') {
      router.push('/todos');
    }
  };

  if (reminders.length === 0) return null;

  const current = reminders[currentIndex];
  if (!current) return null;

  const isLoading = actionLoading === current.id;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 animate-pulse-subtle">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Bell icon + reminder info */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          onClick={() => handleNavigate(current)}
          title={current.source === 'todo' ? 'Go to todos' : 'Go to application'}
        >
          {/* Animated bell */}
          <span className="relative flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-blue-900 text-sm font-semibold truncate group-hover:underline">
              {current.source === 'todo' && <span className="text-indigo-600 mr-1">📋</span>}
              {current.title}
            </p>
            <p className="text-blue-700 text-xs truncate">
              {current.subtitle}
              {' · '}
              Due {timeAgo(current.nextDate)}
              {current.reminderType === 'recurring' && current.recurrenceInterval && (
                <span className="ml-1 text-blue-500">
                  (repeats {current.recurrenceInterval.replace('_', ' ')})
                </span>
              )}
              {current.emailEnabled && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-blue-500" title="Email reminder enabled">
                  <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {current.emailSentAt ? 'sent' : 'email'}
                </span>
              )}
            </p>
          </div>

          {/* Counter badge */}
          {reminders.length > 1 && (
            <span className="flex-shrink-0 text-xs bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {currentIndex + 1}/{reminders.length}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Snooze dropdown */}
          <div className="relative" ref={snoozeRef}>
            <button
              onClick={() => setSnoozeOpenId(snoozeOpenId === current.id ? null : current.id)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition disabled:opacity-50"
              title="Snooze"
            >
              Snooze
            </button>
            {snoozeOpenId === current.id && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[120px]">
                {SNOOZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSnooze(current, opt.value)}
                    className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-blue-50 transition"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => handleDismiss(current)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition disabled:opacity-50"
            title="Dismiss"
          >
            Dismiss
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(current)}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
            title="Delete reminder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(12deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(2deg); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
        :global(.animate-wiggle) {
          animation: wiggle 1.5s ease-in-out infinite;
        }
        :global(.animate-pulse-subtle) {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
