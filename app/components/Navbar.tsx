'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              CareerPilot AI
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8 items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tailor"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Tailor Resume
                </Link>
                <Link
                  href="/auth/setup-2fa"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                  title="Two-Factor Authentication"
                >
                  🔐 Security
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
