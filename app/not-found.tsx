import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
          <SearchX className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
