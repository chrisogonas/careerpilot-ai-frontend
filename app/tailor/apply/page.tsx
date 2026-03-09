"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";
import {
  ConnectedEmailProvider,
  EmailOAuthProvider,
  TailorApplyPayload,
} from "@/lib/types";

interface TailorApplyData {
  job_title: string;
  company_name: string;
  job_description: string;
  resume_text: string;
  cover_letter_text?: string;
  resume_id?: string;
}

function TailorApplyContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "resume_only";
  const includeCoverLetter = mode === "with_cover_letter";

  const [data, setData] = useState<TailorApplyData | null>(null);
  const [providers, setProviders] = useState<ConnectedEmailProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EmailOAuthProvider | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingBody, setGeneratingBody] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [appliedAppId, setAppliedAppId] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const hasFetched = useRef(false);

  // Load data from sessionStorage, fetch providers & credit balance (no AI call)
  useEffect(() => {
    if (authLoading || !isAuthenticated || hasFetched.current) return;
    hasFetched.current = true;

    const raw = sessionStorage.getItem("tailor_apply_data");
    if (!raw) {
      setError("No application data found. Please go back to the tailor page and try again.");
      return;
    }

    let parsed: TailorApplyData;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setError("Invalid application data. Please go back to the tailor page and try again.");
      return;
    }

    // Remove it so it isn't stale on refresh
    sessionStorage.removeItem("tailor_apply_data");
    setData(parsed);

    // Set a default subject (no AI call yet — user can trigger AI compose)
    setSubject(`Application for ${parsed.job_title} – ${parsed.company_name}`);

    // Fetch providers and credit balance in parallel
    apiClient.getConnectedEmailProviders().then((res) => {
      setProviders(res.connected_providers);
      if (res.connected_providers.length > 0) {
        setSelectedProvider(res.connected_providers[0].provider);
      }
    }).catch(() => {});

    apiClient.getProfile().then((profile) => {
      setCreditsRemaining(profile.credits_remaining ?? null);
    }).catch(() => {});
  }, [authLoading, isAuthenticated, user, includeCoverLetter]);

  const handleSend = async () => {
    if (!data) return;
    if (!selectedProvider) {
      setError("Please select an email provider. Connect one in your Profile settings.");
      return;
    }
    if (!recipientEmail.trim()) {
      setError("Recipient email is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!body.trim()) {
      setError("Email body is required");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const hasCL = includeCoverLetter && !!data.cover_letter_text;

      const payload: TailorApplyPayload = {
        provider: selectedProvider,
        recipient_email: recipientEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
        job_title: data.job_title,
        company_name: data.company_name,
        job_description: data.job_description,
        resume_text: data.resume_text,
        cover_letter_text: hasCL ? data.cover_letter_text : undefined,
        resume_id: data.resume_id,
      };

      const result = await apiClient.tailorApply(payload);
      setAppliedAppId(result.app_id);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send email";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleComposeWithAI = async () => {
    if (!data) return;
    if (creditsRemaining !== null && creditsRemaining < 2) {
      setError("Insufficient credits. You need 2 credits to compose with AI. Purchase more credits in your Profile.");
      return;
    }

    const hasCL = includeCoverLetter && !!data.cover_letter_text;

    try {
      setGeneratingBody(true);
      setError(null);

      const res = await apiClient.generateApplyBody({
        job_title: data.job_title,
        company_name: data.company_name,
        include_cover_letter: hasCL,
        user_name: user?.full_name || "",
        resume_text: data.resume_text,
        job_description: data.job_description,
      });

      setSubject(res.subject);
      setBody(res.body);
      if (res.credits_remaining !== undefined) {
        setCreditsRemaining(res.credits_remaining);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate email body";
      setError(msg);
    } finally {
      setGeneratingBody(false);
    }
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3" />
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600">Please sign in to send application emails.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been sent and the job has been saved to your applications with status &quot;Applied&quot;.
          </p>
          <div className="flex flex-col gap-3">
            {appliedAppId && (
              <a
                href={`/applications/${appliedAppId}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition text-center"
              >
                View Application
              </a>
            )}
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition"
            >
              Close Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasCL = includeCoverLetter && !!data?.cover_letter_text;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send Application Email
          </h1>
          {data && (
            <p className="text-gray-600 mt-1">
              Applying for <strong>{data.job_title}</strong> at <strong>{data.company_name}</strong>
            </p>
          )}
        </div>

        {!data && error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Attachment Indicators */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Resume.pdf
                </span>
                {hasCL && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-sm font-medium text-purple-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    Cover_Letter.pdf
                  </span>
                )}
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Send From</label>
                {providers.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    No email accounts connected. Go to{" "}
                    <a href="/profile" className="underline font-medium" target="_blank" rel="noopener noreferrer">
                      Profile Settings
                    </a>{" "}
                    to connect Gmail or Outlook.
                  </div>
                ) : (
                  <select
                    value={selectedProvider || ""}
                    onChange={(e) => setSelectedProvider(e.target.value as EmailOAuthProvider)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {providers.map((p) => (
                      <option key={p.provider} value={p.provider}>
                        {p.provider === "gmail" ? "Gmail" : "Outlook"} — {p.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">To</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="hiring@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Subject</label>
                {generatingBody ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    Generating subject...
                  </div>
                ) : (
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                )}
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">Message</label>
                  {body && !generatingBody && (
                    <span className="text-xs text-gray-400">Feel free to edit before sending</span>
                  )}
                </div>
                {generatingBody ? (
                  <div className="w-full px-4 py-8 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    AI is composing your email...
                  </div>
                ) : (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    placeholder="Write your email body here, or use the AI compose button below..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                  />
                )}
              </div>

              {/* Compose with AI */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleComposeWithAI}
                  disabled={generatingBody || (creditsRemaining !== null && creditsRemaining < 2)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                >
                  {generatingBody ? (
                    <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  )}
                  {generatingBody ? "Composing..." : "Compose mail with AI"}
                </button>
                <span className="text-xs text-gray-500">
                  Costs <strong>2 credits</strong> per use
                  {creditsRemaining !== null && (
                    <> &middot; You have <strong className={creditsRemaining < 2 ? "text-red-600" : "text-green-600"}>{creditsRemaining}</strong> credit{creditsRemaining !== 1 ? "s" : ""}</>
                  )}
                </span>
              </div>
              {creditsRemaining !== null && creditsRemaining < 2 && (
                <p className="text-xs text-red-600 -mt-2">
                  Not enough credits.{" "}
                  <a href="/profile" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                    Purchase more credits
                  </a>{" "}
                  to use AI compose.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => window.close()}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || generatingBody || providers.length === 0}
                className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Application
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3" />
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

export default function TailorApplyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>}>
      <TailorApplyContent />
    </Suspense>
  );
}
