"use client";

import { useEffect, useRef, useCallback } from "react";

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "pointerdown",
];

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 2 * 60 * 1000; // show warning 2 minutes before logout

interface UseInactivityTimeoutOptions {
  /** Called when the inactivity timer expires. */
  onTimeout: () => void;
  /** Called ~2 min before timeout so the UI can show a warning. */
  onWarning?: () => void;
  /** Called whenever user activity is detected (e.g. to dismiss warning). */
  onActivity?: () => void;
  /** Whether the timeout is active (only when user is authenticated). */
  enabled?: boolean;
}

/**
 * Monitors user activity and fires `onTimeout` after 30 minutes of
 * inactivity. Optionally fires `onWarning` 2 minutes before that.
 */
export function useInactivityTimeout({
  onTimeout,
  onWarning,
  onActivity,
  enabled = true,
}: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();

    if (!enabled) return;

    // Warning timer
    if (onWarning) {
      warningRef.current = setTimeout(() => {
        onWarning();
      }, INACTIVITY_MS - WARNING_MS);
    }

    // Logout timer
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, INACTIVITY_MS);
  }, [clearTimers, enabled, onTimeout, onWarning]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Start timers
    resetTimers();

    // Reset on any user activity
    const handleActivity = () => {
      onActivity?.();
      resetTimers();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [enabled, resetTimers, clearTimers]);
}
