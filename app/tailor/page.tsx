"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { TailorResponse, Resume, CoverLetterResponse, StarStoryResponse } from "@/lib/types";

interface ResumeInputError {
  message: string;
}

export default function TailorResumePage() {
  const { user, isAuthenticated, isLoading: authLoading, getResumes } = useAuth();
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
  const [coverLetterResult, setCoverLetterResult] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);

  // STAR stories toggle
  const [generateStarStories, setGenerateStarStories] = useState(false);
  const [starStoryCount, setStarStoryCount] = useState(3);
  const [starStoriesResult, setStarStoriesResult] = useState<string[] | null>(null);
  const [starStoriesLoading, setStarStoriesLoading] = useState(false);

  // Collapsible result sections
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(false);
  const [starStoriesExpanded, setStarStoriesExpanded] = useState(false);

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
    };

    if (isAuthenticated) {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
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

    try {
      if (!user) throw new Error("User not found");

      const response = await apiClient.tailorResume({
        user_id: user.id,
        resume_text: resumeText,
        job_description: jobDescription,
        options: {
          target_role: targetRole,
          tone,
        },
      });

      setResult(response);
      setStep("result");

      // Generate cover letter if toggled on
      if (generateCoverLetter) {
        setCoverLetterLoading(true);
        try {
          const clResponse = await apiClient.generateCoverLetter({
            user_id: user.id,
            resume_text: resumeText,
            job_description: jobDescription,
            company_name: companyName || "the company",
            role_title: targetRole,
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
      if (generateStarStories) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
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
    setError("");
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

              {/* Tone */}
              <div>
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
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700 capitalize">
                          {t}
                        </span>
                      </label>
                    )
                  )}
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name (optional)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
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
              {result && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Extracted Requirements
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {result.extracted_requirements}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your Tailored Resume
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {result.tailored_resume}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.tailored_resume);
                        alert("Resume copied to clipboard!");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Copy Resume
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Tailor Another Resume
                    </button>
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
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
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
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {story}
                                </p>
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
                            applied_resume_text: result.tailored_resume,
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
