'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotifications, ParkedReminder } from '@/lib/context/NotificationContext';
import { SnoozeDuration } from '@/lib/types';

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

export default function NotificationTray() {
  const { parkedReminders, removeParkedReminder, clearAllParked } = useNotifications();
  const {
    dismissReminder, snoozeReminder,
    snoozeTodoReminder, dismissTodoReminder,
    isAuthenticated,
  } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSnoozeOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const count = parkedReminders.length;

  const handleSnooze = async (reminder: ParkedReminder, duration: SnoozeDuration) => {
    setSnoozeOpenId(null);
    setActionLoading(reminder.id);
    try {
      if (reminder.source === 'follow_up') {
        const realId = reminder.id.replace('fu_', '');
        await snoozeReminder(realId, duration);
      } else {
        await snoozeTodoReminder(reminder.sourceId!, duration);
      }
      removeParkedReminder(reminder.id);
    } catch (err) {
      console.error('Snooze failed:', err);
      // Optimistic: still remove from tray; next poll will re-park if backend didn't persist
      removeParkedReminder(reminder.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reminder: ParkedReminder) => {
    setActionLoading(reminder.id);
    try {
      if (reminder.source === 'follow_up') {
        const realId = reminder.id.replace('fu_', '');
        await dismissReminder(realId);
      } else {
        await dismissTodoReminder(reminder.sourceId!);
      }
      removeParkedReminder(reminder.id);
    } catch (err) {
      console.error('Dismiss failed:', err);
      removeParkedReminder(reminder.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNavigate = (reminder: ParkedReminder) => {
    removeParkedReminder(reminder.id);
    if (reminder.source === 'follow_up' && reminder.sourceId) {
      router.push(`/applications/${reminder.sourceId}`);
    } else {
      router.push('/todos');
    }
    setIsOpen(false);
  };

  return (
    <div ref={trayRef} className="fixed bottom-6 right-6 z-50">
      {/* Bell icon button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setSnoozeOpenId(null); }}
        className={`relative p-3 rounded-full shadow-lg transition-all duration-200 ${
          count > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
        }`}
        title={count > 0 ? `${count} parked reminder${count !== 1 ? 's' : ''}` : 'No reminders'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Badge count */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </button>

      {/* Flyout panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-slideUp">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-800">
              Reminders ({count})
            </h3>
            {count > 0 && (
              <button
                onClick={clearAllParked}
                className="text-xs text-gray-500 hover:text-red-600 transition"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {count === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400 text-sm">
                No parked reminders
              </div>
            ) : (
              parkedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition group"
                >
                  {/* Reminder info — click to navigate */}
                  <div
                    className="cursor-pointer"
                    onClick={() => handleNavigate(reminder)}
                    title={reminder.source === 'todo' ? 'Go to todos' : 'Go to application'}
                  >
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition">
                      {reminder.source === 'todo' && <span className="text-indigo-600 mr-1">📋</span>}
                      {reminder.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {reminder.subtitle} · Due {timeAgo(reminder.nextDate)}
                    </p>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2 mt-2">
                    {/* Snooze toggle */}
                    <button
                      onClick={() => setSnoozeOpenId(snoozeOpenId === reminder.id ? null : reminder.id)}
                      disabled={actionLoading === reminder.id}
                      className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition disabled:opacity-50"
                    >
                      {snoozeOpenId === reminder.id ? 'Cancel' : 'Snooze'}
                    </button>

                    {/* Dismiss */}
                    <button
                      onClick={() => handleDismiss(reminder)}
                      disabled={actionLoading === reminder.id}
                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>

                  {/* Inline snooze duration picker — renders in normal flow so it's never clipped */}
                  {snoozeOpenId === reminder.id && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      {SNOOZE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSnooze(reminder, opt.value)}
                          className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.animate-slideUp) {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
