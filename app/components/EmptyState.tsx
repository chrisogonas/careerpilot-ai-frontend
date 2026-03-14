import Link from "next/link";
import type { ElementType } from "react";

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6">{subtitle}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
