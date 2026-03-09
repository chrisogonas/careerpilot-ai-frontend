"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { TailorResponse, Resume, CoverLetterResponse, StarStoryResponse } from "@/lib/types";

interface SaveTailoredResponse {
  message: string;
  resume_id: string;
}

interface ResumeInputError {
  message: string;
}

function TailorResumeContent() {
  const { user, isAuthenticated, isLoading: authLoading, getResumes } = useAuth();

  // Helper: strip CUSTOMIZATION EXPLANATION / GAP ANALYSIS from tailored resume text
  const getCleanResume = (text: string) => {
    const markers = [
      text.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/),
      text.search(/\*{0,2}GAP ANALYSIS\*{0,2}/),
    ].filter(m => m !== -1);
    const earliest = markers.length ? Math.min(...markers) : -1;
    return earliest !== -1 ? text.substring(0, earliest).trimEnd() : text;
  };

  // Save tailored resume states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();
  const [step, setStep] = useState<"input" | "result">("input");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState<"professional" | "conversational" | "concise">("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TailorResponse | null>(null);

  // Resume selection states
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeInputError, setResumeInputError] = useState<ResumeInputError | null>(null);
  const [showResumeText, setShowResumeText] = useState(false);

  // Cover letter toggle
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [variationStyle, setVariationStyle] = useState<"balanced" | "skills-focused" | "experience-focused" | "concise">("balanced");
  const [coverLetterResult, setCoverLetterResult] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);

  // STAR stories toggle
  const [generateStarStories, setGenerateStarStories] = useState(false);
  const [starStoryCount, setStarStoryCount] = useState(3);
  const [starStoriesResult, setStarStoriesResult] = useState<string[] | null>(null);
  const [starStoriesLoading, setStarStoriesLoading] = useState(false);

  // Collapsible result sections
  const [resumeExpanded, setResumeExpanded] = useState(true);
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(false);
  const [starStoriesExpanded, setStarStoriesExpanded] = useState(false);
  const [extractedReqsExpanded, setExtractedReqsExpanded] = useState(false);
  const [customizationExpanded, setCustomizationExpanded] = useState(false);
  const [gapAnalysisExpanded, setGapAnalysisExpanded] = useState(false);
  const [diffViewExpanded, setDiffViewExpanded] = useState(false);
  const [customizationText, setCustomizationText] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [tailorHistory, setTailorHistory] = useState<Array<{ id: string; tailored_text: string; extracted_requirements?: string; role_title?: string; company_name?: string; created_at: string }>>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionInstructions, setSectionInstructions] = useState("");
  const [sectionEditLoading, setSectionEditLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamStatus, setStreamStatus] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  /**
   * Render text with markdown-style **bold** converted to real <strong> tags.
   * Splits on **...** patterns and alternates between plain text and bold spans.
   */
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");

    // Helper: render inline **bold** within a line
    const renderInline = (str: string) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      });
    };

    // Group consecutive lines into blocks: bullet runs become <ul>, others stay as spans
    const elements: React.ReactNode[] = [];
    let bulletBuffer: { text: string; idx: number }[] = [];
    let key = 0;

    const flushBullets = () => {
      if (bulletBuffer.length === 0) return;
      elements.push(
        <ul key={key++} className="list-disc my-0" style={{ paddingLeft: "1.2em" }}>
          {bulletBuffer.map((b) => {
            // Strip the leading bullet char (•, -, *) and whitespace
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

      // Non-bullet line: flush any pending bullets first
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
    flushBullets(); // flush trailing bullets

    return elements;
  };

  // ── Read URL search params for cross-tab prefill (e.g. from Job Search) ──
  const searchParams = useSearchParams();

  // Fetch saved resumes on mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const resumes = await getResumes();
        setSavedResumes(resumes);
        if (resumes.length > 0) {
          setSelectedResumeId(resumes[0].id);
          setResumeText(resumes[0].content);
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      }

      // After loading resumes, apply any resume_prefill from an application detail page
      if (typeof window !== "undefined") {
        const raw = sessionStorage.getItem("resume_prefill");
        if (raw) {
          try {
            const prefill = JSON.parse(raw);
            if (prefill.resume_text) {
              setResumeText(prefill.resume_text);
              setSelectedResumeId(""); // deselect saved resumes since we're using snapshot text
              setShowResumeText(true);  // show the pasted resume textarea
            }
            if (prefill.job_description) setJobDescription(prefill.job_description);
            if (prefill.job_title) setTargetRole(prefill.job_title);
            if (prefill.company_name) setCompanyName(prefill.company_name);
          } catch {}
          sessionStorage.removeItem("resume_prefill");
        }
      }

      // Apply URL search‑param prefill (cross-tab, e.g. from Job Search page)
      const qDesc  = searchParams.get("jobDescription");
      const qTitle = searchParams.get("jobTitle");
      const qCompany = searchParams.get("companyName");
      const qUrl   = searchParams.get("jobUrl");
      if (qDesc)    setJobDescription(qDesc);
      if (qTitle)   setTargetRole(qTitle);
      if (qCompany) setCompanyName(qCompany);
      if (qUrl)     setJobUrl(qUrl);
    };

    if (isAuthenticated) {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowResumeText(false);
    const selectedResume = savedResumes.find((r) => r.id === resumeId);
    if (selectedResume) {
      setResumeText(selectedResume.content);
      setResumeInputError(null);
    }
  };

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resumeText.trim()) {
      setError("Please enter or select a resume");
      return;
    }

    setLoading(true);
    setIsStreaming(true);
    setStreamingText("");
    setStreamStatus("Initializing...");
    setStep("result");
    setResult(null);
    setCustomizationText(null);

    try {
      if (!user) throw new Error("User not found");

      let finalResult: any = null;

      await apiClient.tailorResumeStream(
        {
          user_id: user.id,
          resume_text: resumeText,
          job_description: jobDescription,
          options: {
            target_role: targetRole,
            tone,
            company_name: companyName || undefined,
            variation_style: variationStyle,
          },
        },
        (event) => {
          switch (event.type) {
            case "status":
              setStreamStatus(event.message || "");
              break;
            case "token":
              setStreamingText((prev: string) => prev + (event.content || ""));
              break;
            case "replace":
              setStreamingText(event.content || "");
              break;
            case "done":
              finalResult = {
                tailored_resume: event.tailored_resume || "",
                extracted_requirements: event.extracted_requirements || "",
                usage_id: "",
                credits_remaining: 0,
                job_id: "",
                ats_score: null,
                gap_analysis: event.gap_analysis || "",
              };
              // Extract and store customization explanation so it persists
              {
                const fullText = event.tailored_resume || "";
                const custMarker = fullText.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/);
                if (custMarker !== -1) {
                  let custText = fullText
                    .substring(custMarker)
                    .replace(/^\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}\s*/, "")
                    .trim();
                  const gapM = custText.search(/\*{0,2}GAP ANALYSIS\*{0,2}/);
                  if (gapM !== -1) custText = custText.substring(0, gapM).trim();
                  if (custText) setCustomizationText(custText);
                }
              }
              setResult(finalResult);
              setIsStreaming(false);
              setStreamStatus("");
              break;
            case "ats_score":
              if (finalResult) {
                finalResult = {
                  ...finalResult,
                  ats_score: event.ats_score,
                  job_id: event.job_id || "",
                  credits_remaining: event.credits_remaining || 0,
                };
                setResult({ ...finalResult });
              }
              break;
            case "error":
              setError(event.message || "Streaming failed");
              setIsStreaming(false);
              break;
          }
        }
      );

      // Generate cover letter if toggled on
      if (generateCoverLetter && finalResult) {
        setCoverLetterLoading(true);
        try {
          const clResponse = await apiClient.generateCoverLetter({
            user_id: user.id,
            resume_text: resumeText,
            job_description: jobDescription,
            company_name: companyName || "the company",
            role_title: targetRole,
            tone: tone,
          });
          setCoverLetterResult(clResponse.cover_letter);
        } catch (clErr) {
          console.error("Cover letter generation failed:", clErr);
          setCoverLetterResult("Failed to generate cover letter. You can try again from the Cover Letter page.");
        } finally {
          setCoverLetterLoading(false);
        }
      }

      // Generate STAR stories if toggled on
      if (generateStarStories && finalResult) {
        setStarStoriesLoading(true);
        try {
          const starResponse = await apiClient.generateStarStories({
            user_id: user.id,
            resume_text: resumeText,
            job_description: jobDescription,
            count: starStoryCount,
          });
          setStarStoriesResult(starResponse.star_stories);
        } catch (starErr) {
          console.error("STAR stories generation failed:", starErr);
          setStarStoriesResult(["Failed to generate STAR stories. You can try again from the STAR Stories page."]);
        } finally {
          setStarStoriesLoading(false);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to tailor resume. Please try again."
      );
      setIsStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  // Save tailored resume handler
  const handleSaveTailoredResume = async () => {
    if (!result || !user) return;
    setSaveLoading(true);
    setSaveError("");
    setSaveMessage("");
    try {
      const payload = {
        tailored_text: getCleanResume(result.tailored_resume),
        job_title: targetRole,
      };
      const resp: SaveTailoredResponse = await apiClient.saveTailoredResume(payload);
      setSaveSuccess(true);
      setSaveMessage(resp.message || "Resume saved successfully!");
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save tailored resume.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = () => {
    setSaveLoading(false);
    setSaveSuccess(false);
    setSaveError("");
    setSaveMessage("");
    setStep("input");
    setJobDescription("");
    setResumeText("");
    setSelectedResumeId("");
    setShowResumeText(false);
    setTargetRole("");
    setTone("professional");
    setResult(null);
    setCoverLetterResult(null);
    setCoverLetterLoading(false);
    setStarStoriesResult(null);
    setStarStoriesLoading(false);
    setCustomizationText(null);
    setError("");
    setDiffViewExpanded(false);
    setPdfLoading(false);
    setJobUrl("");
    setUrlLoading(false);
    setVariationStyle("balanced");
    setEditingSection(null);
    setSectionInstructions("");
    setStreamingText("");
    setStreamStatus("");
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Tailor Your Resume</h1>
          <p className="text-gray-600 mt-2">
            Optimize your resume to match specific job descriptions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {step === "input" ? (
          <form onSubmit={handleTailor} className="bg-white rounded-lg shadow p-8">
            <div className="space-y-6">
              {/* Resume - Select from Saved Resumes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Resume *
                </label>

                {/* Error Message */}
                {resumeInputError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-sm">{resumeInputError.message}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {savedResumes.length > 0 ? (
                    <>
                      <select
                        value={selectedResumeId}
                        onChange={(e) => handleResumeSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select a resume --</option>
                        {savedResumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.title} (v{resume.version} • {resume.content.length} chars)
                          </option>
                        ))}
                      </select>
                      {selectedResumeId && (() => {
                        const selectedResume = savedResumes.find((r) => r.id === selectedResumeId);
                        return selectedResume ? (
                          <>
                            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {selectedResume.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Version {selectedResume.version} • {resumeText.length} characters
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Updated: {new Date(selectedResume.updated_at || "").toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowResumeText(!showResumeText)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-4"
                                >
                                  {showResumeText ? "Hide Text" : "View Text"}
                                </button>
                              </div>
                            </div>
                            {showResumeText && (
                              <textarea
                                value={resumeText}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none cursor-default"
                                rows={8}
                              />
                            )}
                          </>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-gray-600">
                        No saved resumes found.{" "}
                        <a href="/resumes/new" className="text-blue-600 hover:underline">
                          Upload a resume
                        </a>{" "}
                        first.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  {resumeText.length} characters loaded
                </p>
              </div>

              {/* Job URL Auto-Extract */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste a job posting URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!jobUrl.trim()) return;
                      try {
                        setUrlLoading(true);
                        const result = await apiClient.extractJobFromURL(jobUrl.trim());
                        setJobDescription(result.job_description);
                        if (result.company) setCompanyName(result.company);
                        if (result.title) setTargetRole(result.title);
                      } catch (err: any) {
                        alert(err.message || "Failed to extract job description");
                      } finally {
                        setUrlLoading(false);
                      }
                    }}
                    disabled={urlLoading || !jobUrl.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition disabled:opacity-60 text-sm whitespace-nowrap"
                  >
                    {urlLoading ? "Extracting..." : "Extract JD"}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Supports LinkedIn, Indeed, Glassdoor, and most job boards
                </p>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role *
                </label>
                <input
                  required
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Data Scientist"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>


              {/* Resume Variation Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { value: "balanced", label: "Balanced", icon: "⚖️" },
                    { value: "skills-focused", label: "Skills-First", icon: "🛠️" },
                    { value: "experience-focused", label: "Experience-First", icon: "💼" },
                    { value: "concise", label: "Concise", icon: "📄" },
                  ] as const).map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setVariationStyle(style.value as any)}
                      className={`p-2 rounded-lg border text-sm font-medium transition ${
                        variationStyle === style.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <span className="block text-lg mb-1">{style.icon}</span>
                      {style.label}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-1">Choose how the tailored resume should be structured</p>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                />
                <p className="text-gray-500 text-sm mt-1">
                  The more detailed, the better the tailoring
                </p>
              </div>

              {/* Cover Letter Toggle */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateCoverLetter}
                    onChange={(e) => setGenerateCoverLetter(e.target.checked)}
                    className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-900">
                      Also generate a Cover Letter
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      A tailored cover letter will be created alongside your resume (costs 2 additional credits)
                    </p>
                  </div>
                </label>

                {generateCoverLetter && (
                  <div className="mt-4 ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Writing Tone
                    </label>
                    <div className="space-y-2">
                      {(["professional", "conversational", "concise"] as const).map(
                        (t) => (
                          <label key={t} className="flex items-center">
                            <input
                              type="radio"
                              name="tone"
                              value={t}
                              checked={tone === t}
                              onChange={(e) =>
                                setTone(e.target.value as typeof tone)
                              }
                              className="h-4 w-4 text-purple-600"
                            />
                            <span className="ml-2 text-gray-700 capitalize">
                              {t}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* STAR Stories Toggle */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateStarStories}
                    onChange={(e) => setGenerateStarStories(e.target.checked)}
                    className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-900">
                      Also generate STAR Interview Stories
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Get interview-ready STAR stories (Situation, Task, Action, Result) tailored to this job (costs 1 additional credit)
                    </p>
                  </div>
                </label>

                {generateStarStories && (
                  <div className="mt-4 ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Stories
                    </label>
                    <select
                      value={starStoryCount}
                      onChange={(e) => setStarStoryCount(Number(e.target.value))}
                      aria-label="Number of STAR stories"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "story" : "stories"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !resumeText.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? (() => {
                      const extras = [
                        generateCoverLetter && "Cover Letter",
                        generateStarStories && "STAR Stories",
                      ].filter(Boolean);
                      return extras.length
                        ? `Tailoring Resume & Generating ${extras.join(" & ")}...`
                        : "Tailoring Resume...";
                    })()
                  : (() => {
                      const extras = [
                        generateCoverLetter && "Cover Letter",
                        generateStarStories && "STAR Stories",
                      ].filter(Boolean);
                      return extras.length
                        ? `Tailor Resume & Generate ${extras.join(" & ")}`
                        : "Tailor Resume";
                    })()}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tailored Resume
              </h2>
              {/* Streaming Progress Display */}
              {isStreaming && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700">{streamStatus}</span>
                  </div>
                  {streamingText && (
                    <div className="bg-white p-4 rounded-lg border border-blue-200 max-h-96 overflow-y-auto">
                      <div className="text-gray-700 whitespace-pre-wrap text-sm">
                        {renderFormattedText(streamingText)}
                        <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-0.5"></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* ATS Match Score Badge */}
              {result?.ats_score && (
                <div className="mb-6 p-4 rounded-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                      <span>🎯</span> ATS Match Score
                    </h3>
                    <div className={`text-3xl font-bold ${
                      result.ats_score.score >= 80 ? "text-green-600" :
                      result.ats_score.score >= 60 ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {result.ats_score.score}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        result.ats_score.score >= 80 ? "bg-green-500" :
                        result.ats_score.score >= 60 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}
                      style={{ width: `${result.ats_score.score}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {result.ats_score.matched.length > 0 && (
                      <div>
                        <p className="font-medium text-green-700 mb-1">✅ Matched Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.ats_score.matched.map((kw: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.ats_score.missing.length > 0 && (
                      <div>
                        <p className="font-medium text-red-700 mb-1">❌ Missing Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.ats_score.missing.map((kw: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {result.ats_score.suggestions && (
                    <div className="mt-3 text-sm text-indigo-700">
                      <p className="font-medium mb-1">💡 Suggestions:</p>
                      <p className="whitespace-pre-wrap">{result.ats_score.suggestions}</p>
                    </div>
                  )}
                </div>
              )}
              {result && (
                <>
                  {/* Tailored Resume Section - collapsible, expanded by default */}
                  <div className="mb-6 border border-blue-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setResumeExpanded(!resumeExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-blue-600">📄</span> Your Tailored Resume
                      </h3>
                      <svg
                        className={`w-5 h-5 text-blue-600 transform transition-transform ${resumeExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {resumeExpanded && (
                      <div className="p-4 bg-blue-50">
                        {/* Tailored Resume Text (without CUSTOMIZATION EXPLANATION) */}
                        <div className="mb-4">
                          <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <div className="text-gray-700 whitespace-pre-wrap text-sm">
                              {renderFormattedText(
                                (() => {
                                  const text = result.tailored_resume;
                                  const markers = [
                                    text.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/),
                                    text.search(/\*{0,2}GAP ANALYSIS\*{0,2}/),
                                  ].filter(m => m !== -1);
                                  const earliest = markers.length ? Math.min(...markers) : -1;
                                  return earliest !== -1
                                    ? text.substring(0, earliest).trimEnd()
                                    : text;
                                })()
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section-level Editing */}
                        <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                          <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1">
                            ✏️ Edit a Section
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {(() => {
                              const resumeText = (() => {
                                const text = result.tailored_resume;
                                const markers = [
                                  text.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/),
                                  text.search(/\*{0,2}GAP ANALYSIS\*{0,2}/),
                                ].filter(m => m !== -1);
                                const earliest = markers.length ? Math.min(...markers) : -1;
                                return earliest !== -1 ? text.substring(0, earliest).trimEnd() : text;
                              })();
                              const sections = [...resumeText.matchAll(/\*\*([A-Z][A-Z\s&\/\-]+)\*\*/g)].map(m => m[1].trim());
                              const unique = [...new Set(sections)];
                              return unique.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => { setEditingSection(editingSection === s ? null : s); setSectionInstructions(""); }}
                                  className={editingSection === s
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
                                onChange={(e) => setSectionInstructions(e.target.value)}
                                placeholder='e.g. "Make it more concise" or "Add more quantified achievements"'
                                className="w-full mt-1 p-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                rows={2}
                              />
                              <button
                                onClick={async () => {
                                  try {
                                    setSectionEditLoading(true);
                                    const resp = await apiClient.editResumeSection({
                                      full_resume: result.tailored_resume,
                                      section_name: editingSection,
                                      instructions: sectionInstructions,
                                      job_description: jobDescription,
                                    });
                                    setResult({ ...result, tailored_resume: resp.updated_resume });
                                    setEditingSection(null);
                                    setSectionInstructions("");
                                  } catch (err: any) {
                                    alert(err.message || "Section edit failed");
                                  } finally {
                                    setSectionEditLoading(false);
                                  }
                                }}
                                disabled={sectionEditLoading || !sectionInstructions.trim()}
                                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                              >
                                {sectionEditLoading ? "Regenerating..." : "Regenerate Section"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Extracted Requirements - nested collapsible */}
                        {result.extracted_requirements && (
                          <div className="mt-6 mb-4 border border-blue-300 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExtractedReqsExpanded(!extractedReqsExpanded)}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                            >
                              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                <span className="text-blue-600">📋</span> Extracted Requirements
                              </h4>
                              <svg
                                className={`w-4 h-4 text-blue-600 transform transition-transform ${extractedReqsExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {extractedReqsExpanded && (
                              <div className="p-4 bg-blue-100/50">
                                <div className="text-gray-700 whitespace-pre-wrap text-sm">
                                  {renderFormattedText(result.extracted_requirements)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Gap Analysis - nested collapsible */}
                        {result.gap_analysis && (
                          <div className="mb-4 border border-amber-300 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setGapAnalysisExpanded(!gapAnalysisExpanded)}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
                            >
                              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                <span className="text-amber-600">🔍</span> Gap Analysis
                              </h4>
                              <svg
                                className={`w-4 h-4 text-amber-600 transform transition-transform ${gapAnalysisExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {gapAnalysisExpanded && (
                              <div className="p-4 bg-amber-50/50">
                                <div className="text-gray-700 whitespace-pre-wrap text-sm">
                                  {renderFormattedText(result.gap_analysis)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customization Explanation - nested collapsible (uses stored state so it persists through edits) */}
                        {customizationText && (
                          <div className="mb-4 border border-blue-300 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setCustomizationExpanded(!customizationExpanded)}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                            >
                              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                <span className="text-blue-600">💡</span> Explaining your Resume Customization
                              </h4>
                              <svg
                                className={`w-4 h-4 text-blue-600 transform transition-transform ${customizationExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {customizationExpanded && (
                              <div className="p-4 bg-blue-100/50">
                                <div className="text-gray-700 whitespace-pre-wrap text-sm">
                                  {renderFormattedText(customizationText)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Save tailored resume button and feedback */}
                        <div className="flex flex-col gap-2 mb-4">
                          <button
                            onClick={handleSaveTailoredResume}
                            disabled={saveLoading || saveSuccess}
                            className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition ${saveLoading || saveSuccess ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            {saveLoading
                              ? "Saving..."
                              : saveSuccess
                              ? "Resume Saved"
                              : "Save my Tailored Resume"}
                          </button>
                          {saveMessage && (
                            <div className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">{saveMessage}</div>
                          )}
                          {saveError && (
                            <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{saveError}</div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getCleanResume(result.tailored_resume));
                            alert("Resume copied to clipboard!");
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                        >
                          Copy Resume
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              setPdfLoading(true);
                              const blob = await apiClient.exportResumePDF({
                                resume_text: getCleanResume(result.tailored_resume),
                                title: targetRole || "Tailored Resume",
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${targetRole || "tailored-resume"}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            } catch (err: any) {
                              alert(err.message || "PDF export failed");
                            } finally {
                              setPdfLoading(false);
                            }
                          }}
                          disabled={pdfLoading}
                          className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-60"
                        >
                          {pdfLoading ? "Generating PDF..." : "Download as PDF"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-indigo-50 border border-indigo-200 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
                    >
                      Tailor Another Resume
                    </button>
                  </div>


                  {/* Side-by-Side Diff View */}
                  <div className="mb-6 border border-amber-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDiffViewExpanded(!diffViewExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-amber-600">🔍</span> Compare Original and Tailored Resumes
                      </h3>
                      <svg
                        className={`w-5 h-5 text-amber-600 transform transition-transform ${diffViewExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {diffViewExpanded && (
                      <div className="p-4 bg-amber-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                              <span className="text-red-500">◀</span> Original Resume
                            </h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{resumeText}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                              <span className="text-green-500">▶</span> Tailored Resume
                            </h4>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                {renderFormattedText(
                                  (() => {
                                    const text = result.tailored_resume;
                                    const markers = [
                                      text.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/),
                                      text.search(/\*{0,2}GAP ANALYSIS\*{0,2}/),
                                    ].filter(m => m !== -1);
                                    const earliest = markers.length ? Math.min(...markers) : -1;
                                    return earliest !== -1 ? text.substring(0, earliest).trimEnd() : text;
                                  })()
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tailoring History */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={async () => {
                        if (!historyExpanded && tailorHistory.length === 0) {
                          try {
                            setHistoryLoading(true);
                            const data = await apiClient.getTailorHistory();
                            setTailorHistory(data.history || []);
                          } catch (err) {
                            console.error("Failed to load history:", err);
                          } finally {
                            setHistoryLoading(false);
                          }
                        }
                        setHistoryExpanded(!historyExpanded);
                      }}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition"
                    >
                      <span className="font-medium text-gray-700">📋 Tailoring History</span>
                      <span className="text-gray-400">{historyExpanded ? "▲" : "▼"}</span>
                    </button>
                    {historyExpanded && (
                      <div className="p-4 pt-0 space-y-3 max-h-96 overflow-y-auto">
                        {historyLoading ? (
                          <p className="text-gray-500 text-sm">Loading history...</p>
                        ) : tailorHistory.length === 0 ? (
                          <p className="text-gray-500 text-sm">No tailoring history yet.</p>
                        ) : (
                          tailorHistory.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition cursor-pointer"
                              onClick={() => {
                                setResult({
                                  tailored_resume: item.tailored_text,
                                  extracted_requirements: item.extracted_requirements || "",
                                  usage_id: "",
                                  credits_remaining: 0,
                                  job_id: "",
                                } as any);
                                setStep("result");
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-800 text-sm">
                                    {item.role_title || "Untitled Role"}
                                  </span>
                                  {item.company_name && (
                                    <span className="text-gray-500 text-sm ml-2">at {item.company_name}</span>
                                  )}
                                </div>
                                <span className="text-gray-400 text-xs">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1 truncate">
                                {item.tailored_text.substring(0, 100)}...
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cover Letter Result */}
                  {coverLetterLoading && (
                    <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
                        <p className="text-purple-800 font-medium">Generating cover letter...</p>
                      </div>
                    </div>
                  )}

                  {coverLetterResult && !coverLetterLoading && (
                    <div className="mt-8 border border-purple-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCoverLetterExpanded(!coverLetterExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 transition cursor-pointer"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-purple-600">✉️</span> Generated Cover Letter
                        </h3>
                        <svg
                          className={`w-5 h-5 text-purple-600 transform transition-transform ${coverLetterExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {coverLetterExpanded && (
                        <div className="p-4 bg-purple-50">
                          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {coverLetterResult}
                          </p>
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coverLetterResult);
                                alert("Cover letter copied to clipboard!");
                              }}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
                            >
                              Copy Cover Letter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STAR Stories Result */}
                  {starStoriesLoading && (
                    <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
                        <p className="text-green-800 font-medium">Generating STAR interview stories...</p>
                      </div>
                    </div>
                  )}

                  {starStoriesResult && !starStoriesLoading && (
                    <div className="mt-8 border border-green-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setStarStoriesExpanded(!starStoriesExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 transition cursor-pointer"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-green-600">⭐</span> STAR Interview Stories ({starStoriesResult.length})
                        </h3>
                        <svg
                          className={`w-5 h-5 text-green-600 transform transition-transform ${starStoriesExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {starStoriesExpanded && (
                        <div className="p-4 bg-green-50">
                          <div className="space-y-4">
                            {starStoriesResult.map((story, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-4 rounded-lg border border-green-200"
                              >
                                <p className="text-sm font-semibold text-green-700 mb-2">
                                  Story {idx + 1}
                                </p>
                                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                  {renderFormattedText(story)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                const allStories = starStoriesResult
                                  .map((s, i) => `--- Story ${i + 1} ---\n${s}`)
                                  .join("\n\n");
                                navigator.clipboard.writeText(allStories);
                                alert("STAR stories copied to clipboard!");
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                            >
                              Copy All STAR Stories
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to Job Applications */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem(
                          "tailor_prefill",
                          JSON.stringify({
                            job_title: targetRole,
                            company_name: companyName,
                            job_description: jobDescription,
                            resume_id: selectedResumeId,
                            applied_resume_text: getCleanResume(result.tailored_resume),
                          })
                        );
                        window.open("/applications/new", "_blank");
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add this to my job applications
                    </button>
                  </div>

                  {/* Ready to Apply? — Email Apply Buttons */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Ready to Apply?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Send your application email directly — your documents will be attached as PDFs.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={!coverLetterResult}
                        onClick={() => {
                          sessionStorage.setItem(
                            "tailor_apply_data",
                            JSON.stringify({
                              job_title: targetRole,
                              company_name: companyName,
                              job_description: jobDescription,
                              resume_text: getCleanResume(result.tailored_resume),
                              cover_letter_text: coverLetterResult,
                              resume_id: selectedResumeId || undefined,
                            })
                          );
                          window.open("/tailor/apply?mode=with_cover_letter", "_blank");
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        Apply with Resume &amp; Cover Letter
                      </button>
                      {!coverLetterResult && (
                        <p className="text-xs text-gray-400 -mt-1 ml-1">
                          Generate a cover letter above to enable this option
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem(
                            "tailor_apply_data",
                            JSON.stringify({
                              job_title: targetRole,
                              company_name: companyName,
                              job_description: jobDescription,
                              resume_text: getCleanResume(result.tailored_resume),
                              resume_id: selectedResumeId || undefined,
                            })
                          );
                          window.open("/tailor/apply?mode=resume_only", "_blank");
                        }}
                        className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Apply with Resume Only
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TailorResumePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>}>
      <TailorResumeContent />
    </Suspense>
  );
}