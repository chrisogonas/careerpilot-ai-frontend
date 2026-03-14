"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try again or return to your dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
