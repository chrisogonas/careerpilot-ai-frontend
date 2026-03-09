"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/utils/api";
import {
  ConnectedEmailProvider,
  EmailOAuthProvider,
  EmailDraftResponse,
  SendApplicationEmailPayload,
  Resume,
} from "@/lib/types";
import CoverLetterSection from "./CoverLetterSection";
import ResumeTailorSection from "./ResumeTailorSection";

interface ApplicationEmailModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSent: (appliedAt: string) => void;
  mode?: "apply" | "forward";
  userName?: string;
}

const EMAIL_COMPOSE_COST = 2;

export default function ApplicationEmailModal({
  applicationId,
  isOpen,
  onClose,
  onSent,
  mode = "apply",
  userName = "",
}: ApplicationEmailModalProps) {
  const [draft, setDraft] = useState<EmailDraftResponse | null>(null);
  const [providers, setProviders] = useState<ConnectedEmailProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EmailOAuthProvider | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [showResumeText, setShowResumeText] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Credit & plan state
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const [userId, setUserId] = useState("");

  // AI compose state
  const [composingBody, setComposingBody] = useState(false);

  // Tailored resume text (set by ResumeTailorSection when tailoring is done)
  const [tailoredResumeText, setTailoredResumeText] = useState("");

  const isForward = mode === "forward";

  const refreshCredits = async () => {
    try {
      const usage = await apiClient.getUsage();
      setCreditsRemaining(usage.credits_remaining);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    if (!isOpen) {
      hasFetched.current = false;
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      setLoadingDraft(true);
      setError(null);
      try {
        // Core email data — these must succeed
        const [draftData, providerData] = await Promise.all([
          apiClient.getEmailDraft(applicationId),
          apiClient.getConnectedEmailProviders(),
        ]);
        setDraft(draftData);
        // Use resumes returned by the draft endpoint (avoids extra API call)
        if (draftData.resumes) {
          setSavedResumes(draftData.resumes);
        }
        setRecipientEmail(isForward ? "" : draftData.recipient_email);

        // Pre-populate cover letter from draft if available
        if (draftData.cover_letter_text) {
          setCoverLetterText(draftData.cover_letter_text);
          setIncludeCoverLetter(true);
        } else {
          setIncludeCoverLetter(false);
          setCoverLetterText("");
        }

        if (isForward) {
          const firstName = userName.split(" ")[0] || userName;
          setSubject(`FW: ${draftData.job_title} at ${draftData.company_name}`);
          setBody(
`Hi,

Please check out this job opening; perhaps you will be interested. I think you can be a good fit based on your background and experience.${draftData.job_url ? `\n\n${draftData.job_url}` : ""}

Thank you,
${firstName}`
          );
          setSelectedResumeId("");
        } else {
          setSubject(draftData.subject);
          setBody(draftData.body);
          setSelectedResumeId("");
        }

        setProviders(providerData.connected_providers);
        if (providerData.connected_providers.length > 0) {
          setSelectedProvider(providerData.connected_providers[0].provider);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load email draft";
        setError(msg);
      } finally {
        setLoadingDraft(false);
      }

      // Credit & plan info — fetch separately so failures don't break the modal
      try {
        const [usage, subscription] = await Promise.all([
          apiClient.getUsage(),
          apiClient.getSubscription().catch(() => null),
        ]);
        setUserId(usage.user_id);
        setCreditsRemaining(usage.credits_remaining);
        setIsFreePlan(
          subscription?.current_plan?.name?.toLowerCase() === "free" ||
          usage.plan === "free"
        );
      } catch {
        // AI features won't show credit info but modal still works
      }
    };

    load();
  }, [isOpen, applicationId, isForward, userName]);

  const selectedResume = savedResumes.find((r) => r.id === selectedResumeId);
  const selectedResumeText = selectedResume?.content || "";

  const handleComposeBody = async () => {
    if (!draft) return;
    setComposingBody(true);
    setError(null);
    try {
      const result = await apiClient.generateApplyBody({
        job_title: draft.job_title,
        company_name: draft.company_name,
        include_cover_letter: !!coverLetterText,
        user_name: userName,
        resume_text: tailoredResumeText || selectedResumeText || undefined,
        job_description: draft.job_description || undefined,
      });
      setBody(result.body);
      if (result.subject) setSubject(result.subject);
      if (result.credits_remaining !== undefined) {
        setCreditsRemaining(result.credits_remaining);
      } else {
        refreshCredits();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compose email body");
    } finally {
      setComposingBody(false);
    }
  };

  const handleSend = async () => {
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
    if (!isForward && includeCoverLetter && !coverLetterText.trim()) {
      setError("Cover letter content is required when 'Include Cover Letter' is checked. Please add content or uncheck the option.");
      return;
    }

    const includeResume = !isForward && !!selectedResumeId;

    try {
      setSending(true);
      setError(null);
      const payload: SendApplicationEmailPayload = {
        provider: selectedProvider,
        recipient_email: recipientEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
        include_resume: includeResume,
        include_cover_letter: !isForward && includeCoverLetter && !!coverLetterText,
        selected_resume_id: includeResume ? selectedResumeId : undefined,
        resume_text: includeResume && tailoredResumeText ? tailoredResumeText : undefined,
        cover_letter_text: !isForward && includeCoverLetter && coverLetterText ? coverLetterText : undefined,
      };
      const result = await apiClient.sendApplicationEmail(applicationId, payload);
      onSent(result.applied_at);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send email";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const canComposeBody = !isFreePlan && creditsRemaining >= EMAIL_COMPOSE_COST && !composingBody;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isForward ? "Forward Job to a Friend" : "Send Application Email"}
            </h2>
            {!isForward && !loadingDraft && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">
                  Credits: <span className={`font-semibold ${creditsRemaining < 5 ? "text-amber-600" : "text-green-600"}`}>{creditsRemaining}</span>
                </span>
                {isFreePlan && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Free Plan</span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {loadingDraft ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
              Loading email draft...
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {draft && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <strong>{draft.job_title}</strong> at <strong>{draft.company_name}</strong>
                </div>
              )}

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Send From
                </label>
                {providers.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    No email accounts connected. Go to{" "}
                    <a href="/profile" className="underline font-medium">Profile Settings</a> to connect Gmail or Outlook.
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

              {/* Recipient Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder={isForward ? "friend@example.com" : "hiring@company.com"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Body with AI Compose */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    Message
                  </label>
                  {!isForward && (
                    <button
                      type="button"
                      onClick={handleComposeBody}
                      disabled={!canComposeBody}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        isFreePlan
                          ? "Upgrade to Pro to use AI compose"
                          : creditsRemaining < EMAIL_COMPOSE_COST
                          ? `Need ${EMAIL_COMPOSE_COST} credits`
                          : "Compose email body with AI"
                      }
                    >
                      {composingBody ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Composing...
                        </>
                      ) : (
                        <>
                          ✨ Compose with AI
                          <span className="opacity-75">({EMAIL_COMPOSE_COST} credits)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {!isForward && isFreePlan && (
                  <p className="text-xs text-amber-600 mb-1">
                    <a href="/pricing" className="underline font-medium">Upgrade to Pro</a> to use AI email composition.
                  </p>
                )}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                />
              </div>

              {/* Resume & Cover Letter & Tailoring — only in apply mode */}
              {!isForward && (
                <div className="space-y-3">
                  {/* Resume Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Resume
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => {
                        setSelectedResumeId(e.target.value);
                        setShowResumeText(false);
                        setTailoredResumeText("");
                        if (!e.target.value) {
                          setIncludeCoverLetter(false);
                          setCoverLetterText("");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Apply without resume</option>
                      {savedResumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} (v{r.version} • {r.content.length} chars)
                          {r.is_default ? " ★" : ""}
                        </option>
                      ))}
                    </select>

                    {/* Selected Resume Preview */}
                    {selectedResume && (
                      <>
                        <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {selectedResume.title}
                              </h4>
                              <p className="text-xs text-gray-600">
                                Version {selectedResume.version} • {selectedResume.content.length} characters
                              </p>
                              <p className="text-xs text-gray-500">
                                Updated: {new Date(selectedResume.updated_at || "").toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowResumeText(!showResumeText)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-3"
                            >
                              {showResumeText ? "Hide Text" : "View Text"}
                            </button>
                          </div>
                        </div>
                        {showResumeText && (
                          <textarea
                            value={selectedResume.content}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-xs focus:outline-none cursor-default"
                            rows={8}
                          />
                        )}
                        <p className="text-xs text-gray-500 italic">
                          This resume will be attached as a PDF.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Resume Tailoring Section */}
                  {selectedResume && draft?.job_description && (
                    <ResumeTailorSection
                      resumeText={selectedResumeText}
                      jobDescription={draft.job_description}
                      jobTitle={draft.job_title}
                      companyName={draft.company_name}
                      isFreePlan={isFreePlan}
                      creditsRemaining={creditsRemaining}
                      onCreditsUsed={refreshCredits}
                      onTailoredResumeReady={setTailoredResumeText}
                      userId={userId}
                    />
                  )}

                  {/* Include Cover Letter Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeCoverLetter}
                      onChange={(e) => {
                        setIncludeCoverLetter(e.target.checked);
                        if (!e.target.checked) {
                          setCoverLetterText("");
                        }
                      }}
                      disabled={!selectedResumeId}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className={`text-sm font-medium ${!selectedResumeId ? "text-gray-400" : "text-gray-900"}`}>
                      Include Cover Letter
                    </span>
                    {!selectedResumeId && (
                      <span className="text-xs text-gray-400 italic">— select a resume first</span>
                    )}
                  </label>

                  {/* Cover Letter Section — visible only when checkbox is checked and a resume is selected */}
                  {includeCoverLetter && selectedResumeId && (
                    <CoverLetterSection
                      resumeText={tailoredResumeText || selectedResumeText}
                      jobDescription={draft?.job_description || ""}
                      jobTitle={draft?.job_title || ""}
                      companyName={draft?.company_name || ""}
                      userName={userName}
                      isFreePlan={isFreePlan}
                      creditsRemaining={creditsRemaining}
                      onCoverLetterChange={(text) => {
                        setCoverLetterText(text);
                      }}
                      coverLetterText={coverLetterText}
                      onCreditsUsed={refreshCredits}
                      userId={userId}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {!isForward && includeCoverLetter && coverLetterText && (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Cover letter attached
              </span>
            )}
            {!isForward && tailoredResumeText && (
              <span className="inline-flex items-center gap-1 ml-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Resume tailored
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || loadingDraft || providers.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition"
            >
              {sending ? "Sending..." : isForward ? "Forward" : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
