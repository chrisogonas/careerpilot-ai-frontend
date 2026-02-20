"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";

export default function SetupTwoFAPage() {
  const [step, setStep] = useState<"scan" | "verify" | "complete">("scan");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Initialize 2FA setup
  useEffect(() => {
    const initSetup = async () => {
      try {
        setLoading(true);
        const response = await apiClient.setupTwoFA();
        setQrCode(response.qr_code);
        setSecret(response.secret);
        setBackupCodes(response.backup_codes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize 2FA setup"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      initSetup();
    }
  }, [isAuthenticated]);

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    setError("");
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await apiClient.verifyTwoFASetup({ code: verificationCode });
      setStep("complete");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid code. Please check your authenticator app."
      );
      setVerificationCode("");
    } finally {
      setVerifying(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-600">Setting up Two-Factor Authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enable Two-Factor Authentication
          </h1>
          <p className="text-gray-600">
            Protect your account with an extra layer of security
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-4 mb-12 justify-center">
          <div
            className={`flex items-center gap-2 ${
              step === "scan" || step === "verify" || step === "complete"
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === "scan" || step === "verify" || step === "complete"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-white"
              }`}
            >
              1
            </div>
            <span className="font-semibold text-sm">Scan QR Code</span>
          </div>
          <div className="h-1 bg-gray-300 w-8 mt-4"></div>
          <div
            className={`flex items-center gap-2 ${
              step === "verify" || step === "complete"
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === "verify" || step === "complete"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-white"
              }`}
            >
              2
            </div>
            <span className="font-semibold text-sm">Verify</span>
          </div>
          <div className="h-1 bg-gray-300 w-8 mt-4"></div>
          <div
            className={`flex items-center gap-2 ${
              step === "complete" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === "complete"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-white"
              }`}
            >
              3
            </div>
            <span className="font-semibold text-sm">Complete</span>
          </div>
        </div>

        {/* Step 1: Scan QR Code */}
        {step === "scan" && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Step 1: Scan QR Code
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy,
                  Microsoft Authenticator, etc.)
                </p>

                {qrCode && (
                  <div className="flex justify-center bg-gray-100 rounded-lg p-6 mb-6">
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                )}
              </div>

              {/* Manual Entry */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-3">
                  Can't scan? Enter this key manually:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                  <code className="font-mono text-lg font-bold text-gray-900">{secret}</code>
                  <button
                    onClick={copySecret}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  >
                    {copiedCode ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setStep("verify")}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                I've Scanned the Code →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === "verify" && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Step 2: Verify Your Setup
            </h2>

            <form onSubmit={handleVerifySetup} className="space-y-6">
              <div>
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit code from your authenticator app to verify the setup:
                </p>

                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleVerificationChange}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                  disabled={verifying}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-semibold text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={verifying || verificationCode.length !== 6}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {verifying ? "Verifying..." : "Verify & Continue →"}
              </button>

              <button
                type="button"
                onClick={() => setStep("scan")}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                ← Back
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Complete - Backup Codes */}
        {step === "complete" && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ✓ Two-Factor Authentication Enabled
            </h2>

            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-semibold">
                  Your account is now protected with two-factor authentication!
                </p>
              </div>

              {/* Backup Codes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Save Your Backup Codes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Save these backup codes in a safe place. You can use them to sign in if you lose
                  access to your authenticator app.
                </p>

                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="mb-4 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  {showBackupCodes ? "Hide Backup Codes" : "Show Backup Codes"}
                </button>

                {showBackupCodes && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded border border-gray-200 font-mono text-sm"
                        >
                          {code}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={copyBackupCodes}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      {copiedCode ? "Copied to Clipboard!" : "Copy All Codes"}
                    </button>
                  </div>
                )}
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ You'll need to enter a 2FA code when you log in</li>
                  <li>✓ Keep your backup codes in a safe place</li>
                  <li>✓ You can disable 2FA anytime from your account settings</li>
                </ul>
              </div>

              {/* Continue Button */}
              <Link
                href="/dashboard"
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
