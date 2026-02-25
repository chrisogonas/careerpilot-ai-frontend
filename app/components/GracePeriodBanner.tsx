'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/utils/api';
import { UsageResponse } from '@/lib/types';

export default function GracePeriodBanner() {
  const { isAuthenticated, user } = useAuth();
  const [graceInfo, setGraceInfo] = useState<{
    inGracePeriod: boolean;
    gracePeriodEnd: string | null;
    daysRemaining: number | null;
  }>({ inGracePeriod: false, gracePeriodEnd: null, daysRemaining: null });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setGraceInfo({ inGracePeriod: false, gracePeriodEnd: null, daysRemaining: null });
      return;
    }

    const checkGracePeriod = async () => {
      try {
        const usage: UsageResponse = await apiClient.getUsage();
        if (usage.in_grace_period) {
          setGraceInfo({
            inGracePeriod: true,
            gracePeriodEnd: usage.grace_period_end,
            daysRemaining: usage.grace_period_days_remaining,
          });
        } else {
          setGraceInfo({ inGracePeriod: false, gracePeriodEnd: null, daysRemaining: null });
        }
      } catch {
        // Silently fail — don't show banner on error
      }
    };

    checkGracePeriod();
  }, [isAuthenticated, user]);

  if (!graceInfo.inGracePeriod) return null;

  const endDate = graceInfo.gracePeriodEnd
    ? new Date(graceInfo.gracePeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 text-lg">⚠️</span>
          <p className="text-amber-800 text-sm font-medium">
            Your subscription has expired.{' '}
            {graceInfo.daysRemaining !== null && graceInfo.daysRemaining > 0 ? (
              <>
                You have <strong>{graceInfo.daysRemaining} day{graceInfo.daysRemaining !== 1 ? 's' : ''}</strong> left
                (until {endDate}) to renew before your account is downgraded to the Free plan.
              </>
            ) : (
              <>Your grace period is expiring today. Renew now to keep your plan.</>
            )}
          </p>
        </div>
        <Link
          href="/subscribe"
          className="ml-4 px-4 py-1.5 bg-amber-600 text-white text-sm font-semibold rounded-md hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          Renew Subscription
        </Link>
      </div>
    </div>
  );
}
