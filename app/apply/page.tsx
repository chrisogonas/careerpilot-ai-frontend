"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";
import {
  Resume,
  ConnectedEmailProvider,
  EmailOAuthProvider,
  TailorApplyPayload,
} from "@/lib/types";
import TemplateSelector from "@/app/components/TemplateSelector";
import {
  Briefcase,
  Search,
  FileText,
  Sparkles,
  Mail,
  Send,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  LinkIcon,
  AlertCircle,
  ChevronDown,
  Star,
  Download,
} from "lucide-react";

// ── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Job Details", icon: Search, description: "Paste or import the job" },
  { id: 2, label: "Analysis", icon: Sparkles, description: "AI extracts requirements" },
  { id: 3, label: "Resume", icon: FileText, description: "Review your resume" },
  { id: 4, label: "Cover Letter", icon: Mail, description: "Generate cover letter" },
  { id: 5, label: "Submit", icon: Send, description: "Send your application" },
  { id: 6, label: "Track", icon: ClipboardList, description: "Save to your pipeline" },
] as const;

type StepStatus = "upcoming" | "current" | "completed";

// ── Types ────────────────────────────────────────────────────────────────────

interface WizardState {
  // Step 1
  jobDescription: string;
  jobUrl: string;
  roleTitle: string;
  companyName: string;
  // Step 2
  extractedRequirements: string;
  jobId: string;
  selectedResumeId: string;
  shouldTailor: boolean;
  // Step 3
  originalResumeText: string;
  tailoredResume: string;
  atsScore: { score: number; matched: string[]; missing: string[]; suggestions: string } | null;
  gapAnalysis: string;
  customizationText: string;
  // Step 4
  coverLetter: string;
  tone: "professional" | "conversational" | "concise";
  // Step 6
  notes: string;
  location: string;
  salaryRange: string;
  jobType: "full-time" | "part-time" | "contract" | "remote" | "";
}

const INITIAL_STATE: WizardState = {
  jobDescription: "",
  jobUrl: "",
  roleTitle: "",
  companyName: "",
  extractedRequirements: "",
  jobId: "",
  selectedResumeId: "",
  shouldTailor: true,
  originalResumeText: "",
  tailoredResume: "",
  atsScore: null,
  gapAnalysis: "",
  customizationText: "",
  coverLetter: "",
  tone: "professional",
  notes: "",
  location: "",
  salaryRange: "",
  jobType: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strip CUSTOMIZATION EXPLANATION / GAP ANALYSIS markers from tailored resume text */
function getCleanResume(text: string): string {
  const markers = [
    text.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/),
    text.search(/\*{0,2}GAP ANALYSIS\*{0,2}/),
  ].filter((m) => m !== -1);
  const earliest = markers.length ? Math.min(...markers) : -1;
  return earliest !== -1 ? text.substring(0, earliest).trimEnd() : text;
}

/** Render text with **bold** → <strong> and bullet conversion */
function renderFormattedText(text: string): React.ReactNode[] {
  const lines = text.split("\n");

  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const elements: React.ReactNode[] = [];
  let bulletBuffer: { text: string; idx: number }[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={key++} className="list-disc my-0" style={{ paddingLeft: "1.2em" }}>
        {bulletBuffer.map((b) => {
          const body = b.text.replace(/^[•\u2022\-*]\s*/, "");
          return (
            <li key={b.idx} className="pl-0">
              {renderInline(body)}
            </li>
          );
        })}
      </ul>
    );
    bulletBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const isBullet = /^[•\u2022\-*]\s/.test(trimmed);

    if (isBullet) {
      bulletBuffer.push({ text: trimmed, idx: i });
      continue;
    }

    flushBullets();

    if (!trimmed) {
      elements.push(<span key={key++} className="block" style={{ height: "0.5em" }} />);
    } else {
      elements.push(
        <span key={key++} className="block">
          {renderInline(trimmed)}
        </span>
      );
    }
  }
  flushBullets();

  return elements;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ApplyWizardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, getResumes } = useAuth();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // Resume preview toggle (Analysis step)
  const [showResumePreview, setShowResumePreview] = useState(false);

  // Section editing (Resume step)
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionInstructions, setSectionInstructions] = useState("");
  const [sectionEditLoading, setSectionEditLoading] = useState(false);

  // Cover letter generation
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);

  // PDF exports
  const [pdfLoading, setPdfLoading] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [coverLetterPdfLoading, setCoverLetterPdfLoading] = useState(false);

  // Submit step — email
  const [emailProviders, setEmailProviders] = useState<ConnectedEmailProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EmailOAuthProvider | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatingEmailBody, setGeneratingEmailBody] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [appliedAppId, setAppliedAppId] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const emailFetchedRef = useRef(false);

  // Collapsible sections (Resume step)
  const [gapAnalysisExpanded, setGapAnalysisExpanded] = useState(false);
  const [customizationExpanded, setCustomizationExpanded] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch resumes on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const data = await getResumes();
        setResumes(data);
        if (data.length > 0) {
          setState((s) => ({ ...s, selectedResumeId: data[0].id }));
        }
      } catch {
        // non-critical
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fetch email providers when entering Submit step
  useEffect(() => {
    if (step !== 5 || emailFetchedRef.current) return;
    emailFetchedRef.current = true;

    // Set default subject
    if (!emailSubject) {
      setEmailSubject(
        `Application for ${state.roleTitle || "the position"} – ${state.companyName || "your company"}`
      );
    }

    Promise.all([
      apiClient.getConnectedEmailProviders().catch(() => ({ connected_providers: [] })),
      apiClient.getProfile().catch(() => null),
    ]).then(([provRes, profile]) => {
      const providers = provRes.connected_providers || [];
      setEmailProviders(providers);
      if (providers.length > 0) {
        setSelectedProvider(providers[0].provider);
      }
      if (profile?.credits_remaining !== undefined) {
        setCreditsRemaining(profile.credits_remaining);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ── State helpers ────────────────────────────────────────────────────────

  const update = (partial: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...partial }));

  const stepStatus = (s: number): StepStatus =>
    s < step ? "completed" : s === step ? "current" : "upcoming";

  // ── Step 1: Extract URL ──────────────────────────────────────────────────

  const handleExtractUrl = async () => {
    if (!state.jobUrl.trim()) return;
    setUrlLoading(true);
    setError("");
    try {
      const result = await apiClient.extractJobFromURL(state.jobUrl.trim());
      update({
        jobDescription: result.job_description,
        roleTitle: result.title || state.roleTitle,
        companyName: result.company || state.companyName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract job from URL");
    } finally {
      setUrlLoading(false);
    }
  };

  // ── Step 2: Analyze ──────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.analyzeJob({
        job_description: state.jobDescription,
      });
      update({
        extractedRequirements: result.extracted_requirements,
        jobId: result.job_id,
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2→3: Tailor Resume ──────────────────────────────────────────────

  const handleTailor = async () => {
    const resume = resumes.find((r) => r.id === state.selectedResumeId);
    if (!resume) {
      setError("Please select a resume");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.tailorResume({
        user_id: user?.id || "",
        resume_text: resume.content,
        job_description: state.jobDescription,
        options: {
          target_role: state.roleTitle,
          tone: "professional",
          company_name: state.companyName,
        },
      });

      // Extract customization text from tailored resume
      const fullText = result.tailored_resume;
      let custText = "";
      const custMarker = fullText.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/);
      if (custMarker !== -1) {
        custText = fullText
          .substring(custMarker)
          .replace(/^\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}\s*/, "")
          .trim();
        const gapM = custText.search(/\*{0,2}GAP ANALYSIS\*{0,2}/);
        if (gapM !== -1) custText = custText.substring(0, gapM).trim();
      }

      update({
        originalResumeText: resume.content,
        tailoredResume: result.tailored_resume,
        atsScore: result.ats_score || null,
        gapAnalysis: result.gap_analysis || "",
        customizationText: custText,
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume tailoring failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Generate Cover Letter (within step, not on Next) ─────────────

  const handleGenerateCoverLetter = async () => {
    const resume = resumes.find((r) => r.id === state.selectedResumeId);
    if (!resume) return;
    setCoverLetterLoading(true);
    setError("");
    try {
      const result = await apiClient.generateCoverLetter({
        user_id: user?.id || "",
        resume_text: state.tailoredResume
          ? getCleanResume(state.tailoredResume)
          : resume.content,
        job_description: state.jobDescription,
        company_name: state.companyName || "the company",
        role_title: state.roleTitle,
        tone: state.tone,
      });
      update({ coverLetter: result.cover_letter });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed");
    } finally {
      setCoverLetterLoading(false);
    }
  };

  // ── Step 5: Email sending ────────────────────────────────────────────────

  const handleSendEmail = async () => {
    if (!selectedProvider) {
      setError("Please select an email provider.");
      return;
    }
    if (!recipientEmail.trim()) {
      setError("Recipient email is required.");
      return;
    }
    if (!emailSubject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!emailBody.trim()) {
      setError("Email body is required.");
      return;
    }
    setSendingEmail(true);
    setError("");
    try {
      const resume = resumes.find((r) => r.id === state.selectedResumeId);
      const resumeText = state.tailoredResume
        ? getCleanResume(state.tailoredResume)
        : resume?.content || "";

      const payload: TailorApplyPayload = {
        provider: selectedProvider,
        recipient_email: recipientEmail.trim(),
        subject: emailSubject.trim(),
        body: emailBody.trim(),
        job_title: state.roleTitle,
        company_name: state.companyName,
        job_description: state.jobDescription,
        resume_text: resumeText,
        cover_letter_text: state.coverLetter || undefined,
        resume_id: state.selectedResumeId || undefined,
      };

      const result = await apiClient.tailorApply(payload);
      setAppliedAppId(result.app_id);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleComposeEmailWithAI = async () => {
    if (creditsRemaining !== null && creditsRemaining < 2) {
      setError("Insufficient credits. You need 2 credits for AI compose.");
      return;
    }
    setGeneratingEmailBody(true);
    setError("");
    try {
      const resume = resumes.find((r) => r.id === state.selectedResumeId);
      const resumeText = state.tailoredResume
        ? getCleanResume(state.tailoredResume)
        : resume?.content || "";

      const res = await apiClient.generateApplyBody({
        job_title: state.roleTitle,
        company_name: state.companyName,
        include_cover_letter: !!state.coverLetter,
        user_name: user?.full_name || "",
        resume_text: resumeText,
        job_description: state.jobDescription,
      });
      setEmailSubject(res.subject);
      setEmailBody(res.body);
      if (res.credits_remaining !== undefined) {
        setCreditsRemaining(res.credits_remaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setGeneratingEmailBody(false);
    }
  };

  // ── Step 6: Create Application ───────────────────────────────────────────

  const handleCreateApplication = async () => {
    setLoading(true);
    setError("");
    try {
      const resume = resumes.find((r) => r.id === state.selectedResumeId);
      const resumeText = state.tailoredResume
        ? getCleanResume(state.tailoredResume)
        : resume?.content;

      await apiClient.createApplication({
        job_title: state.roleTitle || "Untitled Position",
        company_name: state.companyName || "Unknown Company",
        job_url: state.jobUrl || undefined,
        job_description: state.jobDescription,
        status: emailSent ? "applied" : "saved",
        resume_id: state.selectedResumeId || undefined,
        notes: state.notes || undefined,
        salary_range: state.salaryRange || undefined,
        location: state.location || undefined,
        job_type: state.jobType || undefined,
        applied_resume_text: resumeText,
      });
      router.push("/applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  // ── PDF Downloads ────────────────────────────────────────────────────────

  const handleDownloadResumePDF = async (templateId: string) => {
    const resume = resumes.find((r) => r.id === state.selectedResumeId);
    const text = state.tailoredResume
      ? getCleanResume(state.tailoredResume)
      : resume?.content || "";
    try {
      setPdfLoading(true);
      const blob = await apiClient.exportResumePDF({
        resume_text: text,
        title: state.roleTitle || "Resume",
        template: templateId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.roleTitle || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadCoverLetterPDF = async () => {
    if (!state.coverLetter) return;
    try {
      setCoverLetterPdfLoading(true);
      const blob = await apiClient.exportResumePDF({
        resume_text: state.coverLetter,
        title: `Cover Letter – ${state.roleTitle || "Application"}`,
        template: "classic",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${state.companyName || "application"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setCoverLetterPdfLoading(false);
    }
  };

  // ── Section editing (Resume step) ────────────────────────────────────────

  const handleSectionEdit = async () => {
    if (!editingSection || !sectionInstructions.trim() || !state.tailoredResume)
      return;
    setSectionEditLoading(true);
    try {
      const resp = await apiClient.editResumeSection({
        full_resume: state.tailoredResume,
        section_name: editingSection,
        instructions: sectionInstructions,
        job_description: state.jobDescription,
      });
      update({ tailoredResume: resp.updated_resume });
      setEditingSection(null);
      setSectionInstructions("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Section edit failed");
    } finally {
      setSectionEditLoading(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        return state.jobDescription.trim().length > 20;
      case 2:
        return !!state.extractedRequirements && !!state.selectedResumeId;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    setError("");
    switch (step) {
      case 1:
        await handleAnalyze();
        break;
      case 2: {
        const resume = resumes.find((r) => r.id === state.selectedResumeId);
        if (!resume) {
          setError("Please select a resume");
          return;
        }
        if (state.shouldTailor) {
          await handleTailor();
        } else {
          update({
            originalResumeText: resume.content,
            tailoredResume: "",
            atsScore: null,
            gapAnalysis: "",
            customizationText: "",
          });
          setStep(3);
        }
        break;
      }
      case 3:
        setStep(4);
        break;
      case 4:
        setStep(5);
        break;
      case 5:
        setStep(6);
        break;
      case 6:
        await handleCreateApplication();
        break;
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError("");
      setStep(step - 1);
    }
  };

  const getNextLabel = (): string => {
    switch (step) {
      case 1:
        return "Analyze Job";
      case 2:
        return state.shouldTailor ? "Tailor Resume & Continue" : "Continue";
      case 3:
        return "Generate Cover Letter";
      case 4:
        return "Continue to Submit";
      case 5:
        return "Continue to Track";
      default:
        return "Save & Track";
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Apply to Job
          </h1>
          <p className="text-slate-500 mt-1">
            Complete each step to prepare a polished application
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const status = stepStatus(s.id);
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        status === "completed"
                          ? "bg-green-500 text-white"
                          : status === "current"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {status === "completed" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${
                        status === "current"
                          ? "text-blue-600"
                          : status === "completed"
                            ? "text-green-600"
                            : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mt-[-16px] ${
                        step > s.id ? "bg-green-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {step === 1 && (
            <StepJobInput
              state={state}
              update={update}
              urlLoading={urlLoading}
              onExtractUrl={handleExtractUrl}
            />
          )}
          {step === 2 && (
            <StepAnalysis
              state={state}
              update={update}
              resumes={resumes}
              showPreview={showResumePreview}
              onTogglePreview={() => setShowResumePreview(!showResumePreview)}
            />
          )}
          {step === 3 && (
            <StepResume
              state={state}
              update={update}
              resumes={resumes}
              editingSection={editingSection}
              sectionInstructions={sectionInstructions}
              sectionEditLoading={sectionEditLoading}
              gapAnalysisExpanded={gapAnalysisExpanded}
              customizationExpanded={customizationExpanded}
              pdfLoading={pdfLoading}
              templateSelectorOpen={templateSelectorOpen}
              selectedTemplate={selectedTemplate}
              onSetEditingSection={setEditingSection}
              onSetSectionInstructions={setSectionInstructions}
              onSectionEdit={handleSectionEdit}
              onToggleGapAnalysis={() => setGapAnalysisExpanded(!gapAnalysisExpanded)}
              onToggleCustomization={() =>
                setCustomizationExpanded(!customizationExpanded)
              }
              onOpenTemplateSelector={() => setTemplateSelectorOpen(true)}
              onCloseTemplateSelector={() => setTemplateSelectorOpen(false)}
              onSelectTemplate={setSelectedTemplate}
              onDownloadPDF={handleDownloadResumePDF}
            />
          )}
          {step === 4 && (
            <StepCoverLetter
              state={state}
              update={update}
              loading={coverLetterLoading}
              pdfLoading={coverLetterPdfLoading}
              onGenerate={handleGenerateCoverLetter}
              onDownloadPDF={handleDownloadCoverLetterPDF}
            />
          )}
          {step === 5 && (
            <StepSubmit
              state={state}
              resumes={resumes}
              emailProviders={emailProviders}
              selectedProvider={selectedProvider}
              recipientEmail={recipientEmail}
              emailSubject={emailSubject}
              emailBody={emailBody}
              sendingEmail={sendingEmail}
              generatingEmailBody={generatingEmailBody}
              emailSent={emailSent}
              appliedAppId={appliedAppId}
              creditsRemaining={creditsRemaining}
              pdfLoading={pdfLoading}
              coverLetterPdfLoading={coverLetterPdfLoading}
              templateSelectorOpen={templateSelectorOpen}
              selectedTemplate={selectedTemplate}
              onSelectProvider={setSelectedProvider}
              onSetRecipient={setRecipientEmail}
              onSetSubject={setEmailSubject}
              onSetBody={setEmailBody}
              onSend={handleSendEmail}
              onComposeAI={handleComposeEmailWithAI}
              onDownloadResumePDF={handleDownloadResumePDF}
              onDownloadCoverLetterPDF={handleDownloadCoverLetterPDF}
              onOpenTemplateSelector={() => setTemplateSelectorOpen(true)}
              onCloseTemplateSelector={() => setTemplateSelectorOpen(false)}
              onSelectTemplate={setSelectedTemplate}
            />
          )}
          {step === 6 && (
            <StepTrack
              state={state}
              update={update}
              emailSent={emailSent}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance() || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : step === 6 ? (
              <>
                Save & Track
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                {getNextLabel()}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Job Input ────────────────────────────────────────────────────────

function StepJobInput({
  state,
  update,
  urlLoading,
  onExtractUrl,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  urlLoading: boolean;
  onExtractUrl: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Enter Job Details
        </h2>
        <p className="text-sm text-slate-500">
          Paste the job description or import it from a URL
        </p>
      </div>

      {/* URL Extract */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Import from URL (optional)
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="url"
              placeholder="https://linkedin.com/jobs/..."
              value={state.jobUrl}
              onChange={(e) => update({ jobUrl: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={onExtractUrl}
            disabled={urlLoading || !state.jobUrl.trim()}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {urlLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Extract
          </button>
        </div>
      </div>

      {/* Role & Company */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role Title
          </label>
          <input
            type="text"
            placeholder="e.g., Senior Software Engineer"
            value={state.roleTitle}
            onChange={(e) => update({ roleTitle: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            placeholder="e.g., Google"
            value={state.companyName}
            onChange={(e) => update({ companyName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={10}
          placeholder="Paste the full job description here..."
          value={state.jobDescription}
          onChange={(e) => update({ jobDescription: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">
          {state.jobDescription.length > 0
            ? `${state.jobDescription.length} characters`
            : "Minimum 20 characters"}
        </p>
      </div>
    </div>
  );
}

// ── Step 2: Analysis + Resume Selection ──────────────────────────────────────

function StepAnalysis({
  state,
  update,
  resumes,
  showPreview,
  onTogglePreview,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  resumes: Resume[];
  showPreview: boolean;
  onTogglePreview: () => void;
}) {
  const selectedResume = resumes.find((r) => r.id === state.selectedResumeId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Job Analysis Complete
        </h2>
        <p className="text-sm text-slate-500">
          AI extracted the key requirements from{" "}
          {state.companyName ? (
            <span className="font-medium">{state.companyName}</span>
          ) : (
            "the job posting"
          )}
          {state.roleTitle && (
            <>
              {" "}
              for <span className="font-medium">{state.roleTitle}</span>
            </>
          )}
        </p>
      </div>

      {/* Extracted Requirements */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Extracted Requirements
        </h3>
        <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
          {state.extractedRequirements}
        </div>
      </div>

      {/* Next step prompt */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>Next:</strong> Select your preferred resume.
        </p>
      </div>

      {/* Resume Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Resume <span className="text-red-500">*</span>
        </label>
        {resumes.length > 0 ? (
          <div className="space-y-3">
            <div className="relative">
              <select
                value={state.selectedResumeId}
                onChange={(e) => {
                  update({
                    selectedResumeId: e.target.value,
                    tailoredResume: "",
                    atsScore: null,
                    gapAnalysis: "",
                    customizationText: "",
                  });
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-8"
              >
                <option value="">-- Select a resume --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} (v{r.version} • {r.content.length} chars)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Selected resume info card */}
            {selectedResume && (
              <>
                <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-900">
                        {selectedResume.title}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Version {selectedResume.version} •{" "}
                        {selectedResume.content.length} characters
                      </p>
                      <p className="text-xs text-slate-500">
                        Updated:{" "}
                        {new Date(
                          selectedResume.updated_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onTogglePreview}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-4"
                    >
                      {showPreview ? "Hide Text" : "View Text"}
                    </button>
                  </div>
                </div>
                {showPreview && (
                  <textarea
                    value={selectedResume.content}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm focus:outline-none cursor-default"
                    rows={8}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-600 text-sm">
              No saved resumes found.{" "}
              <Link href="/resumes" className="text-blue-600 hover:underline">
                Upload one first
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Tailor checkbox */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.shouldTailor}
            onChange={(e) => update({ shouldTailor: e.target.checked })}
            className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-semibold text-slate-900">
              Should we tailor your resume to match these requirements?
            </span>
            <p className="text-sm text-slate-600 mt-1">
              AI will optimize your resume to highlight relevant skills and
              experience for this specific role (costs 1 credit)
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

// ── Step 3: Resume Display ───────────────────────────────────────────────────

function StepResume({
  state,
  update,
  resumes,
  editingSection,
  sectionInstructions,
  sectionEditLoading,
  gapAnalysisExpanded,
  customizationExpanded,
  pdfLoading,
  templateSelectorOpen,
  selectedTemplate,
  onSetEditingSection,
  onSetSectionInstructions,
  onSectionEdit,
  onToggleGapAnalysis,
  onToggleCustomization,
  onOpenTemplateSelector,
  onCloseTemplateSelector,
  onSelectTemplate,
  onDownloadPDF,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  resumes: Resume[];
  editingSection: string | null;
  sectionInstructions: string;
  sectionEditLoading: boolean;
  gapAnalysisExpanded: boolean;
  customizationExpanded: boolean;
  pdfLoading: boolean;
  templateSelectorOpen: boolean;
  selectedTemplate: string;
  onSetEditingSection: (s: string | null) => void;
  onSetSectionInstructions: (s: string) => void;
  onSectionEdit: () => void;
  onToggleGapAnalysis: () => void;
  onToggleCustomization: () => void;
  onOpenTemplateSelector: () => void;
  onCloseTemplateSelector: () => void;
  onSelectTemplate: (t: string) => void;
  onDownloadPDF: (template: string) => void;
}) {
  const isTailored = state.shouldTailor && !!state.tailoredResume;
  const resume = resumes.find((r) => r.id === state.selectedResumeId);
  const displayText = isTailored
    ? getCleanResume(state.tailoredResume)
    : resume?.content || state.originalResumeText;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          {isTailored ? "Resume Tailored!" : "Your Resume"}
        </h2>
        <p className="text-sm text-slate-500">
          {isTailored
            ? "Your resume has been optimized to match the job requirements"
            : "Review your resume before continuing"}
        </p>
      </div>

      {/* ATS Match Score (tailored only) */}
      {isTailored && state.atsScore && (
        <div className="p-4 rounded-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
              <span>🎯</span> ATS Match Score
            </h3>
            <div
              className={`text-3xl font-bold ${
                state.atsScore.score >= 80
                  ? "text-green-600"
                  : state.atsScore.score >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {state.atsScore.score}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all ${
                state.atsScore.score >= 80
                  ? "bg-green-500"
                  : state.atsScore.score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${state.atsScore.score}%` }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {state.atsScore.matched.length > 0 && (
              <div>
                <p className="font-medium text-green-700 mb-1">
                  ✅ Matched Keywords:
                </p>
                <div className="flex flex-wrap gap-1">
                  {state.atsScore.matched.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {state.atsScore.missing.length > 0 && (
              <div>
                <p className="font-medium text-red-700 mb-1">
                  ❌ Missing Keywords:
                </p>
                <div className="flex flex-wrap gap-1">
                  {state.atsScore.missing.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {state.atsScore.suggestions && (
            <div className="mt-3 text-sm text-indigo-700">
              <p className="font-medium mb-1">💡 Suggestions:</p>
              <p className="whitespace-pre-wrap">{state.atsScore.suggestions}</p>
            </div>
          )}
        </div>
      )}

      {/* Resume Text */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          📄 {isTailored ? "Tailored Resume" : "Resume"}
        </h3>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {isTailored
              ? renderFormattedText(displayText)
              : displayText}
          </div>
        </div>
      </div>

      {/* Section-level Editing (tailored only) */}
      {isTailored && (
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1">
            ✏️ Edit a Section
          </h4>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(() => {
              const sections = [
                ...displayText.matchAll(/\*\*([A-Z][A-Z\s&\/\-]+)\*\*/g),
              ].map((m) => m[1].trim());
              const unique = [...new Set(sections)];
              return unique.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSetEditingSection(editingSection === s ? null : s);
                    onSetSectionInstructions("");
                  }}
                  className={
                    editingSection === s
                      ? "px-2.5 py-1 text-xs rounded-full font-medium transition bg-emerald-600 text-white"
                      : "px-2.5 py-1 text-xs rounded-full font-medium transition bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                  }
                >
                  {s}
                </button>
              ));
            })()}
          </div>
          {editingSection && (
            <div className="mt-2">
              <label className="text-xs text-emerald-700 font-medium">
                Instructions for &ldquo;{editingSection}&rdquo;:
              </label>
              <textarea
                value={sectionInstructions}
                onChange={(e) => onSetSectionInstructions(e.target.value)}
                placeholder='e.g. "Make it more concise" or "Add more quantified achievements"'
                className="w-full mt-1 p-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={2}
              />
              <button
                onClick={onSectionEdit}
                disabled={sectionEditLoading || !sectionInstructions.trim()}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {sectionEditLoading ? "Regenerating..." : "Regenerate Section"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gap Analysis (tailored only, collapsed) */}
      {isTailored && state.gapAnalysis && (
        <div className="border border-amber-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={onToggleGapAnalysis}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
          >
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-amber-600">🔍</span> Gap Analysis
            </h4>
            <svg
              className={`w-4 h-4 text-amber-600 transform transition-transform ${gapAnalysisExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {gapAnalysisExpanded && (
            <div className="p-4 bg-amber-50/50">
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {renderFormattedText(state.gapAnalysis)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customization Explanation (tailored only, collapsed) */}
      {isTailored && state.customizationText && (
        <div className="border border-blue-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={onToggleCustomization}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
          >
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">💡</span> Customization
              Explanation
            </h4>
            <svg
              className={`w-4 h-4 text-blue-600 transform transition-transform ${customizationExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {customizationExpanded && (
            <div className="p-4 bg-blue-100/50">
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {renderFormattedText(state.customizationText)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download PDF */}
      <button
        onClick={onOpenTemplateSelector}
        disabled={pdfLoading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {pdfLoading ? "Generating PDF..." : "Download Resume as PDF"}
      </button>
      <TemplateSelector
        open={templateSelectorOpen}
        onClose={onCloseTemplateSelector}
        selectedTemplate={selectedTemplate}
        onSelect={async (templateId) => {
          onSelectTemplate(templateId);
          onDownloadPDF(templateId);
        }}
      />
    </div>
  );
}

// ── Step 4: Cover Letter ─────────────────────────────────────────────────────

function StepCoverLetter({
  state,
  update,
  loading,
  pdfLoading,
  onGenerate,
  onDownloadPDF,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  loading: boolean;
  pdfLoading: boolean;
  onGenerate: () => void;
  onDownloadPDF: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            {state.coverLetter ? "Cover Letter Ready" : "Cover Letter"}
          </h2>
          <p className="text-sm text-slate-500">
            {state.coverLetter
              ? "Review, edit, and download your personalized cover letter"
              : "Generate a tailored cover letter for this application"}
          </p>
        </div>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Writing Tone
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "professional", label: "Professional", icon: "👔" },
              { value: "conversational", label: "Conversational", icon: "💬" },
              { value: "concise", label: "Concise", icon: "📝" },
            ] as const
          ).map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update({ tone: t.value })}
              className={`p-3 rounded-lg border text-sm font-medium transition ${
                state.tone === t.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              <span className="block text-lg mb-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Cover Letter...
          </>
        ) : state.coverLetter ? (
          <>
            <Sparkles className="h-4 w-4" />
            Regenerate Cover Letter
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Cover Letter
          </>
        )}
      </button>

      {/* Editable Cover Letter */}
      {state.coverLetter && (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Your Cover Letter
              </h3>
              <button
                onClick={() => navigator.clipboard.writeText(state.coverLetter)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy to clipboard
              </button>
            </div>
            <textarea
              value={state.coverLetter}
              onChange={(e) => update({ coverLetter: e.target.value })}
              rows={14}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1">
              Edit directly to make any changes before continuing
            </p>
          </div>

          {/* Download PDF */}
          <button
            onClick={onDownloadPDF}
            disabled={pdfLoading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {pdfLoading
              ? "Generating PDF..."
              : "Download Cover Letter as PDF"}
          </button>
        </>
      )}

      {/* Skip tip */}
      {!state.coverLetter && !loading && (
        <p className="text-xs text-slate-400 text-center">
          You can skip this step by clicking &ldquo;Continue to Submit&rdquo;
          below
        </p>
      )}
    </div>
  );
}

// ── Step 5: Submit Application ───────────────────────────────────────────────

function StepSubmit({
  state,
  resumes,
  emailProviders,
  selectedProvider,
  recipientEmail,
  emailSubject,
  emailBody,
  sendingEmail,
  generatingEmailBody,
  emailSent,
  appliedAppId,
  creditsRemaining,
  pdfLoading,
  coverLetterPdfLoading,
  templateSelectorOpen,
  selectedTemplate,
  onSelectProvider,
  onSetRecipient,
  onSetSubject,
  onSetBody,
  onSend,
  onComposeAI,
  onDownloadResumePDF,
  onDownloadCoverLetterPDF,
  onOpenTemplateSelector,
  onCloseTemplateSelector,
  onSelectTemplate,
}: {
  state: WizardState;
  resumes: Resume[];
  emailProviders: ConnectedEmailProvider[];
  selectedProvider: EmailOAuthProvider | null;
  recipientEmail: string;
  emailSubject: string;
  emailBody: string;
  sendingEmail: boolean;
  generatingEmailBody: boolean;
  emailSent: boolean;
  appliedAppId: string | null;
  creditsRemaining: number | null;
  pdfLoading: boolean;
  coverLetterPdfLoading: boolean;
  templateSelectorOpen: boolean;
  selectedTemplate: string;
  onSelectProvider: (p: EmailOAuthProvider) => void;
  onSetRecipient: (s: string) => void;
  onSetSubject: (s: string) => void;
  onSetBody: (s: string) => void;
  onSend: () => void;
  onComposeAI: () => void;
  onDownloadResumePDF: (template: string) => void;
  onDownloadCoverLetterPDF: () => void;
  onOpenTemplateSelector: () => void;
  onCloseTemplateSelector: () => void;
  onSelectTemplate: (t: string) => void;
}) {
  const hasCoverLetter = !!state.coverLetter;
  const hasEmail = emailProviders.length > 0;

  // Success state
  if (emailSent) {
    return (
      <div className="space-y-5 text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Application Sent!
        </h2>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          Your email has been sent successfully. Click &ldquo;Continue to
          Track&rdquo; to save this application to your pipeline.
        </p>
        {appliedAppId && (
          <Link
            href={`/applications/${appliedAppId}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
          >
            View application details →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Submit Application
        </h2>
        <p className="text-sm text-slate-500">
          {hasEmail
            ? "Send your application email directly — documents will be attached as PDFs"
            : "Download your documents and submit directly to the employer"}
        </p>
      </div>

      {/* Download Buttons (always visible) */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          📎 Download Documents
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onOpenTemplateSelector}
            disabled={pdfLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {pdfLoading ? "Generating..." : "Resume PDF"}
          </button>
          {hasCoverLetter && (
            <button
              onClick={onDownloadCoverLetterPDF}
              disabled={coverLetterPdfLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {coverLetterPdfLoading ? "Generating..." : "Cover Letter PDF"}
            </button>
          )}
        </div>
      </div>
      <TemplateSelector
        open={templateSelectorOpen}
        onClose={onCloseTemplateSelector}
        selectedTemplate={selectedTemplate}
        onSelect={async (templateId) => {
          onSelectTemplate(templateId);
          onDownloadResumePDF(templateId);
        }}
      />

      {/* Email Form (only if providers connected) */}
      {hasEmail ? (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-600" />
              Send Application Email
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your resume
              {hasCoverLetter ? " and cover letter" : ""} will be attached as
              PDF{hasCoverLetter ? "s" : ""}
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Attachment badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-800">
                📄 Resume.pdf
              </span>
              {hasCoverLetter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-800">
                  ✉️ Cover_Letter.pdf
                </span>
              )}
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Send From
              </label>
              <select
                value={selectedProvider || ""}
                onChange={(e) =>
                  onSelectProvider(e.target.value as EmailOAuthProvider)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {emailProviders.map((p) => (
                  <option key={p.provider} value={p.provider}>
                    {p.provider === "gmail" ? "Gmail" : "Outlook"} — {p.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                To
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => onSetRecipient(e.target.value)}
                placeholder="hiring@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Subject
              </label>
              {generatingEmailBody ? (
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating subject...
                </div>
              ) : (
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => onSetSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              )}
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-900">
                  Message
                </label>
                {emailBody && !generatingEmailBody && (
                  <span className="text-xs text-slate-400">
                    Feel free to edit before sending
                  </span>
                )}
              </div>
              {generatingEmailBody ? (
                <div className="w-full px-4 py-8 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI is composing your email...
                </div>
              ) : (
                <textarea
                  value={emailBody}
                  onChange={(e) => onSetBody(e.target.value)}
                  rows={8}
                  placeholder="Write your email body here, or use the AI compose button below..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
              )}
            </div>

            {/* Compose with AI */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onComposeAI}
                disabled={
                  generatingEmailBody ||
                  (creditsRemaining !== null && creditsRemaining < 2)
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
              >
                {generatingEmailBody ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generatingEmailBody ? "Composing..." : "Compose with AI"}
              </button>
              <span className="text-xs text-slate-500">
                Costs <strong>2 credits</strong>
                {creditsRemaining !== null && (
                  <>
                    {" "}
                    · You have{" "}
                    <strong
                      className={
                        creditsRemaining < 2
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {creditsRemaining}
                    </strong>{" "}
                    credit{creditsRemaining !== 1 ? "s" : ""}
                  </>
                )}
              </span>
            </div>

            {/* Send Button */}
            <button
              onClick={onSend}
              disabled={sendingEmail || generatingEmailBody}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Application
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
          <p className="text-sm text-amber-800 mb-3">
            No email accounts connected yet. Connect Gmail or Outlook in your{" "}
            <Link
              href="/profile"
              className="underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Profile Settings
            </Link>{" "}
            to send applications directly.
          </p>
          <p className="text-xs text-amber-600">
            You can download your documents above and submit manually.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 6: Track Application ────────────────────────────────────────────────

function StepTrack({
  state,
  update,
  emailSent,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  emailSent: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Save to Your Pipeline
        </h2>
        <p className="text-sm text-slate-500">
          Add any final details before saving this application
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">Role:</span>{" "}
            <span className="font-medium text-slate-800">
              {state.roleTitle || "Untitled"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Company:</span>{" "}
            <span className="font-medium text-slate-800">
              {state.companyName || "Unknown"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Resume tailored:</span>{" "}
            <span
              className={`font-medium ${state.shouldTailor && state.tailoredResume ? "text-green-700" : "text-slate-600"}`}
            >
              {state.shouldTailor && state.tailoredResume ? "Yes ✓" : "No"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Cover letter:</span>{" "}
            <span
              className={`font-medium ${state.coverLetter ? "text-green-700" : "text-slate-600"}`}
            >
              {state.coverLetter ? "Yes ✓" : "Skipped"}
            </span>
          </div>
          {state.atsScore && (
            <div>
              <span className="text-slate-500">ATS Score:</span>{" "}
              <span className="font-medium text-slate-800">
                {state.atsScore.score}%
              </span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Email sent:</span>{" "}
            <span
              className={`font-medium ${emailSent ? "text-green-700" : "text-slate-600"}`}
            >
              {emailSent ? "Yes ✓" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Extra Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g., San Francisco, CA"
            value={state.location}
            onChange={(e) => update({ location: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Type
          </label>
          <div className="relative">
            <select
              value={state.jobType}
              onChange={(e) =>
                update({ jobType: e.target.value as WizardState["jobType"] })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-8"
            >
              <option value="">Select...</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Salary Range
        </label>
        <input
          type="text"
          placeholder="e.g., $120k - $150k"
          value={state.salaryRange}
          onChange={(e) => update({ salaryRange: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          rows={3}
          placeholder="Any notes about this application..."
          value={state.notes}
          onChange={(e) => update({ notes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
}
