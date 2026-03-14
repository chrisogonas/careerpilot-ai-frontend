"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
