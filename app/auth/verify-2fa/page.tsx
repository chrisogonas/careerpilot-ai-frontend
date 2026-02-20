"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function VerifyTwoFAPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { verifyTwoFA, requiresTwoFA } = useAuth();

  // Redirect if not waiting for 2FA
  useEffect(() => {
    if (!requiresTwoFA) {
      router.push("/auth/login");
    }
  }, [requiresTwoFA, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyTwoFA(code);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code. Please try again."
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-900 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                autoFocus
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                Enter the code from your authenticator app
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Can't access your app?</h3>
            <p className="text-sm text-blue-800 mb-3">
              If you've lost access to your authenticator app, you can use your backup codes to sign in.
            </p>
            <Link
              href="/auth/verify-backup-code"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Use backup code instead →
            </Link>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to login
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Lost your authenticator app? Your account is still secure.</p>
          <p className="mt-1">
            <a href="mailto:support@careerpilot.io" className="text-blue-600 hover:text-blue-700">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
