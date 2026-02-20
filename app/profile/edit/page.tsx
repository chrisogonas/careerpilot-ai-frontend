"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      // In a real app, this would call the API to update the profile
      // await apiClient.updateProfile({ full_name: fullName, email });
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <Link href="/profile" className="text-blue-600 hover:text-blue-700">
            ← Back to Profile
          </Link>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <p className="text-green-700 font-semibold">✓ Profile updated successfully!</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to profile...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
              <p className="text-gray-500 text-xs mt-1">Your full name as it appears on your profile</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
              <p className="text-gray-500 text-xs mt-1">
                Changing your email will require verification
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href="/profile"
                  className="flex-1 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 What can you change?</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✓ Full name - Update how your name appears on your profile</li>
            <li>✓ Email address - Changing email requires verification</li>
            <li>✕ Username - Cannot be changed (reserved for future use)</li>
            <li>✕ Account ID - Permanent identifier for your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
