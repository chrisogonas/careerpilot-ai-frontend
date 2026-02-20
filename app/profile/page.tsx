"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { ProfileData } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // In a real app, we'd fetch the full profile data
    // For now, we'll use the user from context
    if (user) {
      setProfile({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        plan: "free",
        credits_remaining: 100,
        email_verified: user.is_verified === "verified",
        two_fa_enabled: false,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });
    }
    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Unable to load profile</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Profile Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </Link>
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Account Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email Verified:</dt>
                  <dd className="text-gray-900 font-medium">
                    {profile.email_verified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">◆ Pending</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Two-Factor Auth:</dt>
                  <dd className="text-gray-900 font-medium">
                    {profile.two_fa_enabled ? (
                      <span className="text-green-600">✓ Enabled</span>
                    ) : (
                      <span className="text-gray-500">◆ Disabled</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Plan:</dt>
                  <dd className="text-gray-900 font-medium capitalize">{profile.plan}</dd>
                </div>
              </dl>
            </div>

            {/* Credits & Usage */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits & Usage</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Credits Remaining</p>
                  <p className="text-4xl font-bold text-blue-600">{profile.credits_remaining}</p>
                  <p className="text-gray-600 text-sm mt-4">
                    Upgrade your plan to get more credits
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-200">
            <Link
              href="/profile/security"
              className="flex items-center justify-center px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors font-medium"
            >
              🔐 Security Settings
            </Link>
            <Link
              href="/pricing"
              className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors font-medium"
            >
              ⭐ Upgrade Plan
            </Link>
            <button
              className="flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  alert("Account deletion flow would be triggered here");
                }
              }}
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                → Back to Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                → View Your Resumes
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                → View Your Cover Letters
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-blue-600 hover:underline">
                → View Pricing Plans
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
