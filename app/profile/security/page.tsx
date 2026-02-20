"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function SecurityPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would call the API to change the password
      // await apiClient.changePassword({ old_password: oldPassword, new_password: newPassword });
      
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordMode(false);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
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
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <Link href="/profile" className="text-blue-600 hover:text-blue-700">
            ← Back to Profile
          </Link>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Password Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🔐 Password</h3>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">Enabled</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Manage your password and keep your account secure.
            </p>
            <button
              onClick={() => setChangePasswordMode(!changePasswordMode)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {changePasswordMode ? "Cancel" : "Change Password"}
            </button>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🔑 Two-Factor Auth</h3>
              <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Disabled</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Add an extra layer of security to your account.
            </p>
            <Link
              href="/auth/setup-2fa"
              className="w-full block py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center"
            >
              Set Up 2FA
            </Link>
          </div>
        </div>

        {/* Change Password Form */}
        {changePasswordMode && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded">
                <p className="text-green-700 font-semibold">✓ {success}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  type={showPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setChangePasswordMode(false)}
                  className="flex-1 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Information */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Information</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">🛡️ Keep Your Password Safe</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Never share your password with anyone</li>
                <li>Use a unique password for your CareerPilot account</li>
                <li>Consider using a password manager</li>
                <li>Change your password regularly</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">🔐 Enable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-2">
                Two-factor authentication (2FA) adds an extra layer of security for your account.
                Even if someone has your password, they won't be able to access your account
                without your authenticator app or backup codes.
              </p>
              <p className="text-sm text-gray-600">
                We recommend enabling 2FA to protect your account and your data.
              </p>
            </div>

            <div className="border-l-4 border-amber-600 pl-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">⚠️ Account Recovery</h3>
              <p className="text-sm text-gray-600">
                Make sure you have access to the email address associated with your account.
                This is essential for password recovery and account security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
