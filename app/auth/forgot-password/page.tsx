"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSent(false);

    if (!email) {
      setLocalError("Please enter your email address");
      return;
    }

    try {
      await requestPasswordReset(email);
      setSent(true);
      setEmail("");
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setSent(false);
      }, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send password reset email";
      setLocalError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Your Password?</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {sent && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded">
            <p className="text-green-700 font-semibold">✓ Email sent successfully!</p>
            <p className="text-green-600 text-sm mt-1">
              Check your inbox for the password reset link. It expires in 1 hour.
            </p>
          </div>
        )}

        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <p className="text-red-700 font-semibold">✕ Error</p>
            <p className="text-red-600 text-sm mt-1">{error || localError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading || sent}
            />
            <p className="text-gray-500 text-xs mt-1">
              We'll send a password reset link to this email address
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || sent}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isLoading || sent
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Sending..." : sent ? "Email Sent!" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
              Back to Login
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>We'll send a link to your email address</li>
            <li>Click the link within 1 hour</li>
            <li>Enter your new password</li>
            <li>Log in with your new password</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
