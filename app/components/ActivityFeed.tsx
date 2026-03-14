"use client";

import { FileText, PenTool, Star, Search, Briefcase, Mic, Zap } from "lucide-react";
import type { ActivityItem } from "@/lib/types";
import type { ElementType } from "react";

const iconMap: Record<string, { icon: ElementType; color: string }> = {
  resume_tailor: { icon: FileText, color: "text-blue-600 bg-blue-50" },
  cover_letter: { icon: PenTool, color: "text-emerald-600 bg-emerald-50" },
  star_stories: { icon: Star, color: "text-amber-600 bg-amber-50" },
  job_analysis: { icon: Search, color: "text-purple-600 bg-purple-50" },
  application: { icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
  mock_interview: { icon: Mic, color: "text-rose-600 bg-rose-50" },
};

const defaultIcon = { icon: Zap, color: "text-gray-600 bg-gray-50" };

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No activity yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Your recent actions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const { icon: Icon, color } = iconMap[item.type] ?? defaultIcon;
        return (
          <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div className={`flex-shrink-0 p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="text-xs text-gray-400">
                {formatRelativeTime(item.created_at)}
              </span>
              {item.credits_used != null && item.credits_used > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.credits_used} cr
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
